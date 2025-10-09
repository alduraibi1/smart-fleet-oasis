import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractNotificationRequest {
  contractId: string;
  customerEmail?: string;
  notificationType: "created" | "expiring" | "expired" | "returned";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { contractId, customerEmail, notificationType }: ContractNotificationRequest = await req.json();

    // جلب بيانات العقد
    const { data: contract, error: contractError } = await supabaseClient
      .from("rental_contracts")
      .select(`
        *,
        customer:customers(name, email, phone),
        vehicle:vehicles(brand, model, plate_number)
      `)
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      throw new Error("العقد غير موجود");
    }

    // جلب إعدادات النظام
    const { data: settings } = await supabaseClient
      .from("system_settings")
      .select("*");

    const companyName = settings?.find((s: any) => s.key === "company_name")?.value || "شركة تأجير السيارات";
    const companyEmail = settings?.find((s: any) => s.key === "company_email")?.value || "info@company.com";

    // تحديد محتوى البريد حسب النوع
    let subject = "";
    let htmlContent = "";

    switch (notificationType) {
      case "created":
        subject = `تأكيد عقد الإيجار رقم ${contract.contract_number}`;
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">تأكيد عقد الإيجار</h2>
            <p>عزيزي/عزيزتي ${contract.customer.name}،</p>
            <p>نشكركم على اختياركم ${companyName}. نؤكد استلام عقد الإيجار التالي:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم العقد:</strong> ${contract.contract_number}</p>
              <p><strong>المركبة:</strong> ${contract.vehicle.brand} ${contract.vehicle.model}</p>
              <p><strong>رقم اللوحة:</strong> ${contract.vehicle.plate_number}</p>
              <p><strong>تاريخ البداية:</strong> ${new Date(contract.start_date).toLocaleDateString('ar-SA')}</p>
              <p><strong>تاريخ النهاية:</strong> ${new Date(contract.end_date).toLocaleDateString('ar-SA')}</p>
              <p><strong>المبلغ الإجمالي:</strong> ${contract.total_amount} ريال</p>
            </div>

            <p>يرجى مراجعة شروط العقد والتأكد من إحضار المستندات المطلوبة عند استلام المركبة.</p>
            <p>للاستفسارات، يرجى التواصل معنا.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ${companyName}<br>
              ${companyEmail}
            </p>
          </div>
        `;
        break;

      case "expiring":
        const daysLeft = Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        subject = `تنبيه: عقد الإيجار ${contract.contract_number} سينتهي قريباً`;
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">تنبيه انتهاء عقد الإيجار</h2>
            <p>عزيزي/عزيزتي ${contract.customer.name}،</p>
            <p>نود تذكيركم بأن عقد الإيجار رقم <strong>${contract.contract_number}</strong> سينتهي خلال <strong>${daysLeft}</strong> يوم.</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #f59e0b;">
              <p><strong>المركبة:</strong> ${contract.vehicle.brand} ${contract.vehicle.model}</p>
              <p><strong>تاريخ الانتهاء:</strong> ${new Date(contract.end_date).toLocaleDateString('ar-SA')}</p>
            </div>

            <p>يرجى التواصل معنا لتجديد العقد أو ترتيب إرجاع المركبة.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ${companyName}<br>
              ${companyEmail}
            </p>
          </div>
        `;
        break;

      case "expired":
        subject = `عقد الإيجار ${contract.contract_number} انتهى`;
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">انتهاء عقد الإيجار</h2>
            <p>عزيزي/عزيزتي ${contract.customer.name}،</p>
            <p>انتهى عقد الإيجار رقم <strong>${contract.contract_number}</strong>.</p>
            
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #dc2626;">
              <p><strong>المركبة:</strong> ${contract.vehicle.brand} ${contract.vehicle.model}</p>
              <p><strong>تاريخ الانتهاء:</strong> ${new Date(contract.end_date).toLocaleDateString('ar-SA')}</p>
            </div>

            <p>يرجى إرجاع المركبة في أقرب وقت ممكن لتجنب أي رسوم إضافية.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ${companyName}<br>
              ${companyEmail}
            </p>
          </div>
        `;
        break;

      case "returned":
        subject = `استلام المركبة - عقد ${contract.contract_number}`;
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">استلام المركبة</h2>
            <p>عزيزي/عزيزتي ${contract.customer.name}،</p>
            <p>نشكركم على إرجاع المركبة. تم استلام المركبة بنجاح.</p>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #16a34a;">
              <p><strong>رقم العقد:</strong> ${contract.contract_number}</p>
              <p><strong>المركبة:</strong> ${contract.vehicle.brand} ${contract.vehicle.model}</p>
              <p><strong>تاريخ الإرجاع:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>

            <p>نتطلع لخدمتكم مرة أخرى.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ${companyName}<br>
              ${companyEmail}
            </p>
          </div>
        `;
        break;
    }

    // إرسال البريد الإلكتروني
    const recipientEmail = customerEmail || contract.customer.email;
    
    if (!recipientEmail) {
      throw new Error("البريد الإلكتروني للعميل غير متوفر");
    }

    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // إنشاء إشعار في قاعدة البيانات
    await supabaseClient.from("smart_notifications").insert({
      title: subject,
      message: `تم إرسال بريد إلكتروني إلى ${recipientEmail}`,
      type: "info",
      category: "contracts",
      priority: "medium",
      reference_type: "contract",
      reference_id: contractId,
      delivery_channels: ["email"],
      status: "sent",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "تم إرسال الإشعار بنجاح",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contract-notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
