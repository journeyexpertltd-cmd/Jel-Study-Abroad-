import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle, AlertCircle, FileText, Download, Printer, ShieldCheck, Mail, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface StudentInvoicesProps {
  currentUser: {
    fullName: string;
    email: string;
    mobileNumber?: string;
  };
}

interface Invoice {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: "Unpaid" | "Success" | "Pending" | "Cancelled" | "Failed";
  dueDate: string;
  paidDate?: string;
  tranId?: string;
  cardType?: string;
}

export function StudentInvoices({ currentUser }: StudentInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Callback banner state
  const [callbackDetails, setCallbackDetails] = useState<{
    show: boolean;
    status: string;
    tranId: string;
    amount: string;
    cardType: string;
  } | null>(null);

  useEffect(() => {
    // 1. Check for SSLCommerz callback values in search params
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get("pay_status");
    const tranId = params.get("tran_id");
    const amount = params.get("amount");
    const cardType = params.get("card_type") || "N/A";

    if (payStatus && tranId && amount) {
      setCallbackDetails({
        show: true,
        status: payStatus,
        tranId,
        amount,
        cardType
      });

      // Automatically email the mock receipt to the student
      triggerMockEmailReceipt(payStatus, tranId, amount, cardType);

      // Clean URL params to prevent re-triggering alert banners on refresh
      const cleanUrl = window.location.origin + window.location.pathname + "?activeTab=portal";
      window.history.replaceState({}, document.title, cleanUrl);
    }

    loadStudentInvoices(payStatus, tranId, cardType);
  }, []);

  const loadStudentInvoices = (payStatus?: string | null, tranId?: string | null, cardType?: string) => {
    const storageKey = `jel_invoices_${currentUser.email}`;
    const saved = localStorage.getItem(storageKey);

    let defaultInvoices: Invoice[] = [
      { id: "INV-2026-001", title: "JEL Admission Processing Fee", description: "Standard document processing, university nomination & application processing charge.", amount: 5000, currency: "BDT", status: "Unpaid", dueDate: "June 30, 2026" },
      { id: "INV-2026-002", title: "Global Health Insurance Premium Deposit", description: "Advance deposit to book international student medical and health plans.", amount: 12000, currency: "BDT", status: "Unpaid", dueDate: "July 15, 2026" },
      { id: "INV-2026-003", title: "Biometric VFS Appointment Reservation", description: "Embassy booking fee for digital scan schedules in Dhaka office.", amount: 3200, currency: "BDT", status: "Unpaid", dueDate: "August 01, 2026" }
    ];

    if (saved) {
      try {
        let parsed = JSON.parse(saved) as Invoice[];
        // If we just got a success callback, update the invoice state
        if (payStatus === "success" && tranId) {
          parsed = parsed.map(inv => {
            // Pay the first unpaid invoice for simulation
            if (inv.status === "Unpaid") {
              return {
                ...inv,
                status: "Success",
                tranId: tranId,
                cardType: cardType || "Visa",
                paidDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              };
            }
            return inv;
          });
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
        setInvoices(parsed);
        return;
      } catch (e) {}
    }

    // Update first invoice if success is passed initially
    if (payStatus === "success" && tranId) {
      defaultInvoices[0].status = "Success";
      defaultInvoices[0].tranId = tranId;
      defaultInvoices[0].cardType = cardType || "Visa";
      defaultInvoices[0].paidDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    setInvoices(defaultInvoices);
    localStorage.setItem(storageKey, JSON.stringify(defaultInvoices));
  };

  const triggerMockEmailReceipt = (status: string, tranId: string, amount: string, cardType: string) => {
    // Post to simulated mail client log or console
    console.log(`[EMAIL SYSTEM DISPATCHED] Receipt emailed successfully to ${currentUser.email} for payment of ${amount} BDT with transaction ${tranId}.`);
  };

  const handlePayNow = async (invoice: Invoice) => {
    setLoadingInvoiceId(invoice.id);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/sslcommerz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.fullName,
          email: currentUser.email,
          phone: currentUser.mobileNumber || "01926400400",
          feeType: invoice.title,
          amount: invoice.amount,
          currency: invoice.currency
        })
      });

      const data = await response.json();
      if (data.success && data.redirectUrl) {
        // Safe navigation to SSLCommerz Checkout Page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || "Gateway initiation error.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to establish SSLCommerz payment session.");
      setLoadingInvoiceId(null);
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate printable invoice sheets.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0B5D3B; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0B5D3B; }
            .meta-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .invoice-title { font-size: 28px; font-weight: 800; color: #111; margin: 0; }
            .status-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .status-Paid { background: #e6f4ea; color: #137333; }
            .status-Unpaid { background: #fce8e6; color: #c5221f; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            th { background: #f8f9fa; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ddd; }
            td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
            .total-row { font-size: 16px; font-weight: bold; text-align: right; margin-top: 30px; }
            .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">JOURNEY EXPERT LTD</div>
              <div style="font-size: 11px; color: #666; margin-top: 4px;">Tejgaon Dhaka Branch Office</div>
            </div>
            <div style="text-align: right;">
              <h2 class="invoice-title">INVOICE</h2>
              <span style="font-size: 12px; color: #666;">No: ${invoice.id}</span>
            </div>
          </div>

          <div class="meta-section">
            <div>
              <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #888; text-transform: uppercase;">Billed To:</h4>
              <strong>${currentUser.fullName}</strong><br/>
              <span>${currentUser.email}</span><br/>
              <span>${currentUser.mobileNumber || "+88019XXXXXXXX"}</span>
            </div>
            <div style="text-align: right;">
              <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #888; text-transform: uppercase;">Invoice Details:</h4>
              <span><strong>Issue Date:</strong> ${invoice.dueDate}</span><br/>
              <span><strong>Status:</strong> <span class="status-badge status-${invoice.status === "Success" ? "Paid" : "Unpaid"}">${invoice.status === "Success" ? "Paid" : "Unpaid"}</span></span>
              ${invoice.tranId ? `<br/><span><strong>Transaction:</strong> ${invoice.tranId}</span>` : ""}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${invoice.title}</strong><br/>
                  <span style="font-size: 11px; color: #777;">${invoice.description}</span>
                </td>
                <td style="text-align: right; font-weight: bold;">${invoice.amount.toLocaleString()} ${invoice.currency}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            Total Amount: ${invoice.amount.toLocaleString()} ${invoice.currency}
          </div>

          <div class="footer">
            Journey Expert Ltd. • Abdul Motin Complex, 189/A, Nabisco Mor, Tejgaon, Dhaka • Support: +8801926400400<br/>
            Thank you for trusting JEL Study Abroad as your certified international pathways guide.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleResetSimInvoices = () => {
    localStorage.removeItem(`jel_invoices_${currentUser.email}`);
    loadStudentInvoices();
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-left" id="invoice-ledger-board">
      
      {/* 1. Callback State Alert Banners */}
      {callbackDetails && (
        <div className={`border rounded-2xl p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in zoom-in-95 duration-200 ${
          callbackDetails.status === "success" 
            ? "bg-emerald-50 border-emerald-200 text-slate-800" 
            : "bg-red-50 border-red-200 text-slate-800"
        }`}>
          <div className="flex items-start space-x-3 text-left">
            {callbackDetails.status === "success" ? (
              <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wide">
                {callbackDetails.status === "success" ? "Online Fee Payment Successful!" : "Gateway Transaction Cancelled/Failed"}
              </h4>
              <p className="text-[11px] text-slate-650 leading-relaxed font-light">
                {callbackDetails.status === "success" 
                  ? `Invoice settled for BDT ${Number(callbackDetails.amount).toLocaleString()}. Gateway transaction registered: ${callbackDetails.tranId}. A certified digital receipt has been emailed to ${currentUser.email}.`
                  : `Your payment request of BDT ${Number(callbackDetails.amount).toLocaleString()} was rejected or cancelled by the gateway. If funds were debited, they will automatically auto-refund within 3 working days.`
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setCallbackDetails(null)}
              className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold py-1.5 px-3 rounded-lg transition hover:bg-slate-50"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left flex items-start space-x-2 animate-in fade-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-650" />
          <span className="text-xs text-red-700 font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-[#0B5D3B]">
            <CreditCard className="h-5 w-5 text-[#0B5D3B]" />
            <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-wider">Fees & Invoice Ledger</h3>
          </div>
          <p className="text-xs text-slate-500">View charges, process secure SSLCommerz deposits, and retrieve printable invoices.</p>
        </div>
        
        <button
          onClick={handleResetSimInvoices}
          className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 p-2 rounded-xl transition border border-slate-200"
          title="Reset Invoice Simulation"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* SSLCommerz Secure Note */}
      <div className="bg-[#0B5D3B]/5 border border-[#0B5D3B]/10 rounded-2xl p-4 flex items-start space-x-3 text-left">
        <ShieldCheck className="h-5 w-5 text-[#0B5D3B] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#0B5D3B] uppercase tracking-wider">Secured via SSLCommerz Gateway</h4>
          <p className="text-[11px] text-slate-650 leading-relaxed font-light">
            SSLCommerz supports checkout across any major bank including bKash, Nagad, Rocket, DBBL Nexus, Visa, and Mastercard cards inside Bangladesh. Safe, encrypted 3D validation is active.
          </p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4 pt-1">
        {invoices.map((inv) => (
          <div key={inv.id} className="border border-slate-100 hover:border-slate-200/80 rounded-2xl p-5 transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="space-y-1 md:w-3/5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{inv.id}</span>
                <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md ${
                  inv.status === "Success" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {inv.status === "Success" ? "Paid" : "Unpaid"}
                </span>
                {inv.paidDate && (
                  <span className="text-[9px] font-mono text-slate-400">on {inv.paidDate}</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-800">{inv.title}</h4>
              <p className="text-[11px] text-slate-500 font-light leading-relaxed">{inv.description}</p>
              
              {inv.tranId && (
                <p className="text-[10px] font-mono text-[#0B5D3B] font-semibold pt-1">
                  Payment Ref: {inv.tranId} • Method: {inv.cardType}
                </p>
              )}
            </div>

            <div className="flex flex-col md:items-end gap-3 w-full md:w-2/5 justify-between shrink-0">
              <div className="text-left md:text-right space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Amount Due</span>
                <p className="text-base font-display font-black text-slate-900">
                  {inv.amount.toLocaleString()} {inv.currency}
                </p>
                <p className="text-[9px] text-slate-400 font-mono">Due on {inv.dueDate}</p>
              </div>

              <div className="flex gap-2 self-start md:self-end w-full md:w-auto">
                <button
                  onClick={() => handlePrintInvoice(inv)}
                  className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 p-2 rounded-xl transition hover:bg-slate-50 text-xs flex items-center space-x-1 font-bold w-1/2 md:w-auto justify-center cursor-pointer"
                  title="Print Invoice / PDF"
                >
                  <Printer className="h-4 w-4" />
                  <span className="md:hidden lg:inline">Print Receipt</span>
                </button>

                {inv.status !== "Success" ? (
                  <button
                    onClick={() => handlePayNow(inv)}
                    disabled={loadingInvoiceId !== null}
                    className="bg-[#0B5D3B] hover:bg-[#074028] text-white py-2 px-4 rounded-xl transition text-xs flex items-center space-x-1.5 font-bold justify-center w-1/2 md:w-auto shrink-0 shadow-xs cursor-pointer"
                  >
                    {loadingInvoiceId === inv.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        <span>Initializing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Pay Online</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase py-2.5 px-4 rounded-xl text-center font-mono border border-emerald-100 flex items-center space-x-1 select-none">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Cleared</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
