import { ConfigMailjetModel } from "./models/config-mailjet.model";

export function mailJetConfig(): ConfigMailjetModel {
  return {
    mail: process.env.MAILJET_EMAIL,
    apiKey: process.env.MAILJET_API_KEY,
    secretKey: process.env.MAILJET_SECRET_KEY,
    version: process.env.MAILJET_VERSION,
    companyName: process.env.MAILJET_COMPANY_NAME,
  };
}
