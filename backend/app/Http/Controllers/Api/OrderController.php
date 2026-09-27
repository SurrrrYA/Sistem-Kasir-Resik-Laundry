<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with([
            'customer',
            'items.service',
        ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => [
                'required',
                'exists:customers,id',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.service_id' => [
                'required',
                'exists:services,id',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'paid_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'status' => [
                'nullable',
                'in:received,processing,ready,completed,cancelled',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $order = DB::transaction(function () use ($validated) {
            $items = $validated['items'];

            $services = Service::whereIn(
                'id',
                collect($items)->pluck('service_id')
            )
                ->get()
                ->keyBy('id');

            $totalAmount = 0;

            foreach ($items as $item) {
                $service = $services[$item['service_id']];

                $subtotal =
                    $item['quantity'] * $service->price;

                $totalAmount += $subtotal;
            }

            $paidAmount = $validated['paid_amount'] ?? 0;

            if ($paidAmount > $totalAmount) {
                abort(
                    422,
                    'Jumlah pembayaran tidak boleh melebihi total pesanan.'
                );
            }

            $paymentStatus = $this->getPaymentStatus(
                $paidAmount,
                $totalAmount
            );

            $order = Order::create([
                'customer_id' => $validated['customer_id'],
                'order_number' => $this->generateOrderNumber(),
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'payment_status' => $paymentStatus,
                'status' => $validated['status'] ?? 'received',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $service = $services[$item['service_id']];

                $price = $service->price;

                $subtotal =
                    $item['quantity'] * $price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'service_id' => $service->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $subtotal,
                ]);
            }

            /*
             * Jika ada pembayaran awal,
             * simpan juga ke tabel payments.
             */
            if ($paidAmount > 0) {
                Payment::create([
                    'order_id' => $order->id,
                    'amount' => $paidAmount,
                    'payment_method' => 'cash',
                    'notes' => 'Pembayaran awal',
                    'paid_at' => now(),
                ]);
            }

            return $order;
        });

        $order->load([
            'customer',
            'items.service',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil ditambahkan.',
            'data' => $order,
        ], 201);
    }

    public function show(Order $order)
    {
        $order->load([
            'customer',
            'items.service',
        ]);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        /*
         * Pesanan yang sudah lunas tidak boleh diedit.
         */
        if ($order->payment_status === 'paid') {
            abort(
                422,
                'Pesanan yang sudah lunas tidak dapat diedit.'
            );
        }

        $validated = $request->validate([
            'customer_id' => [
                'required',
                'exists:customers,id',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.service_id' => [
                'required',
                'exists:services,id',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'status' => [
                'required',
                'in:received,processing,ready,completed,cancelled',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        DB::transaction(function () use (
            $validated,
            $order
        ) {
            /*
             * Lock order supaya aman ketika ada
             * proses pembayaran bersamaan.
             */
            $lockedOrder = Order::lockForUpdate()
                ->findOrFail($order->id);

            $items = $validated['items'];

            $services = Service::whereIn(
                'id',
                collect($items)->pluck('service_id')
            )
                ->get()
                ->keyBy('id');

            $totalAmount = 0;

            foreach ($items as $item) {
                $service = $services[$item['service_id']];

                $subtotal =
                    $item['quantity'] * $service->price;

                $totalAmount += $subtotal;
            }

            /*
             * Pembayaran TIDAK berasal dari request.
             *
             * Ambil pembayaran yang sudah ada
             * dari database.
             */
            $paidAmount = $lockedOrder->paid_amount;

            /*
             * Total baru tidak boleh lebih kecil
             * dari uang yang sudah dibayar.
             */
            if ($paidAmount > $totalAmount) {
                abort(
                    422,
                    'Total pesanan baru tidak boleh lebih kecil dari jumlah yang sudah dibayar.'
                );
            }

            /*
             * Hitung ulang status pembayaran
             * berdasarkan total baru dan pembayaran lama.
             */
            $paymentStatus = $this->getPaymentStatus(
                $paidAmount,
                $totalAmount
            );

            /*
             * UPDATE DATA PESANAN.
             *
             * PERHATIKAN:
             * Tidak ada paid_amount di sini.
             *
             * Jadi pembayaran tidak akan berubah.
             */
            $lockedOrder->update([
                'customer_id' => $validated['customer_id'],
                'total_amount' => $totalAmount,
                'payment_status' => $paymentStatus,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            /*
             * Hapus item lama.
             */
            $lockedOrder->items()->delete();

            /*
             * Buat item baru.
             */
            foreach ($items as $item) {
                $service = $services[$item['service_id']];

                $price = $service->price;

                $subtotal =
                    $item['quantity'] * $price;

                OrderItem::create([
                    'order_id' => $lockedOrder->id,
                    'service_id' => $service->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $subtotal,
                ]);
            }
        });

        /*
         * Refresh object supaya response menggunakan
         * data terbaru dari database.
         */
        $order->refresh();

        $order->load([
            'customer',
            'items.service',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil diperbarui.',
            'data' => $order,
        ]);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dihapus.',
        ]);
    }

    private function getPaymentStatus(
        float|int $paidAmount,
        float|int $totalAmount
    ): string {
        if ($paidAmount <= 0) {
            return 'unpaid';
        }

        if ($paidAmount < $totalAmount) {
            return 'partial';
        }

        return 'paid';
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber =
                'ORD-' .
                now()->format('YmdHis') .
                '-' .
                random_int(100, 999);
        } while (
            Order::where(
                'order_number',
                $orderNumber
            )->exists()
        );

        return $orderNumber;
    }
}