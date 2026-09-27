<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with([
            'order.customer',
        ])
            ->latest('paid_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => [
                'required',
                'exists:orders,id',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'payment_method' => [
                'required',
                'in:cash,transfer,qris',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $payment = DB::transaction(function () use ($validated) {
            $order = Order::lockForUpdate()
                ->findOrFail($validated['order_id']);

            $remainingAmount =
                $order->total_amount - $order->paid_amount;

            if ($validated['amount'] > $remainingAmount) {
                abort(
                    422,
                    'Jumlah pembayaran melebihi sisa pembayaran.'
                );
            }

            $payment = Payment::create([
                'order_id' => $order->id,

                'amount' => $validated['amount'],

                'payment_method' =>
                    $validated['payment_method'],

                'notes' =>
                    $validated['notes'] ?? null,

                'paid_at' => now(),
            ]);

            $newPaidAmount =
                $order->paid_amount + $payment->amount;

            if ($newPaidAmount <= 0) {
                $paymentStatus = 'unpaid';
            } elseif (
                $newPaidAmount < $order->total_amount
            ) {
                $paymentStatus = 'partial';
            } else {
                $paymentStatus = 'paid';
            }

            $order->update([
                'paid_amount' => $newPaidAmount,

                'payment_status' => $paymentStatus,
            ]);

            return $payment;
        });

        $payment->load([
            'order.customer',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil ditambahkan.',
            'data' => $payment,
        ], 201);
    }

    public function show(Payment $payment)
    {
        $payment->load([
            'order.customer',
        ]);

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    public function destroy(Payment $payment)
    {
        DB::transaction(function () use ($payment) {
            $order = Order::lockForUpdate()
                ->findOrFail($payment->order_id);

            $paymentAmount = $payment->amount;

            $payment->delete();

            $newPaidAmount =
                max(
                    0,
                    $order->paid_amount - $paymentAmount
                );

            if ($newPaidAmount <= 0) {
                $paymentStatus = 'unpaid';
            } elseif (
                $newPaidAmount < $order->total_amount
            ) {
                $paymentStatus = 'partial';
            } else {
                $paymentStatus = 'paid';
            }

            $order->update([
                'paid_amount' => $newPaidAmount,

                'payment_status' => $paymentStatus,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dihapus.',
        ]);
    }
}