/**
 * WhatsApp Business API Integration
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

export interface SendMessageParams {
  to: string;
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Format phone number to WhatsApp format (no + or spaces, just digits)
 * Example: +91 9876543210 -> 919876543210
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If it doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    return "91" + cleaned;
  }

  return cleaned;
}

/**
 * Send a text message via WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  params: SendMessageParams,
): Promise<WhatsAppResponse> {
  const apiVersion = config.apiVersion || "v18.0";
  const url = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`;

  const formattedPhone = formatPhoneNumber(params.to);

  // Validate phone number
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: "Invalid phone number format",
    };
  }

  try {
    // Send as text message
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: params.message,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || "Failed to send message",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send messages to multiple recipients with rate limiting
 */
export async function sendBulkWhatsAppMessages(
  config: WhatsAppConfig,
  recipients: Array<{ phone: string; message: string }>,
  delayBetweenMessages: number = 1000,
): Promise<Array<{ phone: string; success: boolean; error?: string }>> {
  const results: Array<{ phone: string; success: boolean; error?: string }> =
    [];

  for (const recipient of recipients) {
    const result = await sendWhatsAppMessage(config, {
      to: recipient.phone,
      message: recipient.message,
    });

    results.push({
      phone: recipient.phone,
      success: result.success,
      error: result.error,
    });

    // Add delay between messages to respect rate limits
    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages));
    }
  }

  return results;
}
