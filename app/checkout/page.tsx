"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  CreditCard,
  Truck,
  MapPin,
  Check,
  AlertCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store";
import { useAuthStore, type UserAddress } from "@/store/useAuthStore";
import { saveOrderToFirebase } from "@/lib/firebase/orders";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const steps = [
  { id: 1, name: "Shipping", icon: MapPin },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Review", icon: Check },
];

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { currentUser, createOrder } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = getTotal();
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shipping;

  const hasLiveFish = items.some(
    (item) => item.product.category === "aquarium-fish"
  );

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasLiveFish && !agreedToWaiver) {
      toast({
        title: "Health Waiver Required",
        description: "Please agree to the live fish health waiver to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "razorpay") {
      toast({
        title: "Razorpay setup pending",
        description: "Razorpay needs live/test keys and backend payment verification before it can accept payments. Please use COD for now.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    if (paymentMethod === "razorpay") {
      toast({
        title: "Razorpay setup pending",
        description: "Payment verification is not connected yet, so this order was not placed.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const shippingAddress: UserAddress = {
      addressLine1: shippingInfo.address,
      area: shippingInfo.city,
      city: shippingInfo.city,
      district: shippingInfo.city,
      pincode: shippingInfo.pincode,
      state: "Tamil Nadu",
      country: "India",
    };

    const order = createOrder({
      userId: currentUser?.id || `guest-${shippingInfo.phone || Date.now()}`,
      userName:
        currentUser?.name || `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
      userEmail: currentUser?.email || shippingInfo.email,
      userPhone: currentUser?.mobile || shippingInfo.phone,
      items: items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0] || "",
        price: item.product.price,
        quantity: item.quantity,
        variant: item.selectedVariants
          ? Object.entries(item.selectedVariants)
              .map(([name, value]) => `${name}: ${value}`)
              .join(", ")
          : undefined,
      })),
      subtotal,
      shipping,
      tax: 0,
      total,
      status: "pending",
      shippingAddress,
      paymentMethod: "COD",
      paymentStatus: "pending",
    });

    const firebaseResult = await saveOrderToFirebase(order).catch(() => ({
      saved: false,
      message: "Order was saved locally, but Firebase order sync failed.",
    }));

    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast({
      title: "Order Placed Successfully!",
      description: firebaseResult.saved
        ? `Your order ${order.id} is saved in Firebase and waiting for confirmation.`
        : `Your order ${order.id} is saved locally. Firebase sync needs checking.`,
      variant: "success",
    });
    
    clearCart();
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <Navigation />

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      currentStep >= step.id
                        ? "bg-secondary text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    Shipping Information
                  </h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          required
                          value={shippingInfo.firstName}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          required
                          value={shippingInfo.lastName}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={shippingInfo.email}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        required
                        value={shippingInfo.address}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          required
                          value={shippingInfo.city}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          required
                          value={shippingInfo.state}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, state: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          required
                          value={shippingInfo.pincode}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, pincode: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Live Fish Waiver */}
                    {hasLiveFish && (
                      <div className="bg-coral/10 border border-coral/20 rounded-lg p-4 mt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-coral mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-coral">Live Fish Health Waiver</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your order contains live fish. By proceeding, you acknowledge:
                            </p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                              <li>Fish will be shipped overnight with express delivery</li>
                              <li>You must be available to receive the package</li>
                              <li>Acclimation instructions must be followed</li>
                              <li>DOA claims must be reported within 2 hours with photos</li>
                            </ul>
                            <div className="flex items-center space-x-2 mt-4">
                              <Checkbox
                                id="waiver"
                                checked={agreedToWaiver}
                                onCheckedChange={(checked) => setAgreedToWaiver(checked as boolean)}
                              />
                              <Label htmlFor="waiver" className="text-sm cursor-pointer">
                                I agree to the live fish shipping waiver
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/cart">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Cart
                        </Link>
                      </Button>
                      <Button type="submit" variant="ocean">
                        Continue to Payment
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-secondary" />
                    Payment Method
                  </h2>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`w-full p-4 rounded-lg border flex items-center gap-4 ${
                          paymentMethod === "razorpay"
                            ? "border-secondary bg-secondary/10"
                            : "hover:border-muted-foreground"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "razorpay" ? "border-secondary" : ""
                        }`}>
                          {paymentMethod === "razorpay" && (
                            <div className="w-3 h-3 bg-secondary rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Pay with Razorpay</p>
                          <p className="text-sm text-muted-foreground">
                            Credit/Debit Card, UPI, Net Banking. Backend verification pending.
                          </p>
                        </div>
                        <CreditCard className="w-6 h-6 text-secondary" />
                      </button>

                      {total < 50000 && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cod")}
                          className={`w-full p-4 rounded-lg border flex items-center gap-4 ${
                            paymentMethod === "cod"
                              ? "border-secondary bg-secondary/10"
                              : "hover:border-muted-foreground"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "cod" ? "border-secondary" : ""
                          }`}>
                            {paymentMethod === "cod" && (
                              <div className="w-3 h-3 bg-secondary rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </div>
                          <Truck className="w-6 h-6 text-accent" />
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button type="submit" variant="ocean">
                        Review Order
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Check className="w-5 h-5 text-secondary" />
                    Review Your Order
                  </h2>

                  {/* Shipping Info */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      <p className="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.pincode}</p>
                      <p>{shippingInfo.phone}</p>
                      <p>{shippingInfo.email}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      <p>{paymentMethod === "razorpay" ? "Razorpay (Card/UPI/Net Banking)" : "Cash on Delivery"}</p>
                      {paymentMethod === "razorpay" && (
                        <p className="mt-2 text-xs text-coral">
                          Razorpay is disabled until test/live keys and backend signature verification are configured.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-4 bg-muted/50 rounded-lg p-3">
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="ocean"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Place Order • ${formatPrice(total)}`}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-card rounded-xl border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs text-primary rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-accent" : ""}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-secondary">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>{paymentMethod === "razorpay" ? "Razorpay setup pending" : "COD order will be saved for admin review"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
