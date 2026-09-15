"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface CustomerSummaryProps {
  siteName: string;
  logoUrl?: string;
  trxId: string;
  expiresAt: string;
  amount: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  onExpire?: () => void;
}

export default function CustomerSummary({
  siteName,
  logoUrl,
  trxId,
  expiresAt,
  amount,
  userName,
  userEmail,
  userPhone,
  onExpire,
}: CustomerSummaryProps) {
  const formattedPhone =
    !userPhone || userPhone.trim() === "" || userPhone === "#" || userPhone === "---"
      ? "Not Provided"
      : userPhone;

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const targetTime = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft("0m 00s");
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className="w-full flex flex-col h-full justify-between">
      <div>
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={40} height={40} className="rounded-md object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                {siteName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-inter font-semibold text-[15px] leading-[22.5px] text-[#111111]">
                {siteName}
              </h1>
              <p className="text-[11px] text-gray-400 font-normal truncate max-w-[180px]">
                Trx ID: {trxId}
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "11px",
                  lineHeight: "16.5px",
                  color: isExpired ? "#EF4444" : "#9CA3AF",
                }}
                className="mt-0.5"
              >
                {isExpired ? "Payment Expired" : `Expires in ${timeLeft}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-inter font-bold text-[18px] leading-[25.5px] text-[#111111]">
              {amount} BDT
            </span>
          </div>
        </div>

        {/* Pricing Subtotal / Total */}
        <div className="py-4 border-b border-gray-100 space-y-2">
          <div className="flex justify-between items-center font-inter font-normal text-[14px] leading-[20px] text-[#4D4D4D]">
            <span>Subtotal</span>
            <span>{amount} BDT</span>
          </div>
          <div className="flex justify-between items-center font-inter font-medium text-[15px] leading-[21.4px] text-[#4D4D4D]">
            <span>Total</span>
            <span>{amount} BDT</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="pt-5">
          <h3 className="font-inter font-medium text-[11px] leading-[16px] text-[#848484] uppercase tracking-wider mb-3">
            Customer Details
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-inter font-normal text-[13px] leading-[19.5px] text-[#4D4D4D]">Name</span>
              <span className="font-inter font-medium text-[13px] leading-[19.5px] text-[#111111]">{userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-inter font-normal text-[13px] leading-[19.5px] text-[#4D4D4D]">Email</span>
              <span className="font-inter font-medium text-[13px] leading-[19.5px] text-[#111111]">{userEmail}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-inter font-normal text-[13px] leading-[19.5px] text-[#4D4D4D]">Phone</span>
              <span className="font-inter font-medium text-[13px] leading-[19.5px] text-[#111111]">{formattedPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support Telegram Redirect Link */}
      <div className="flex items-center justify-between pt-8 text-[13px] font-inter font-normal text-[#949494]">
        <a
          href="https://t.me/The_Linuxuser"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 18" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.930233 9.00001C0.930233 4.02924 4.9907 0 10 0C15.0093 0 19.0698 4.02924 19.0698 9.00001V11.5782C19.175 11.5413 19.2876 11.5299 19.3982 11.5451C19.5087 11.5603 19.614 11.6017 19.7051 11.6656C19.7962 11.7295 19.8706 11.8142 19.9219 11.9126C19.9732 12.0109 20 12.12 20 12.2308V14.0769C20 14.1883 19.9728 14.2981 19.9209 14.3969C19.869 14.4956 19.7938 14.5805 19.7018 14.6443C19.6098 14.7081 19.5036 14.7489 19.3922 14.7633C19.2809 14.7776 19.1677 14.7651 19.0623 14.7268C19.0574 14.9114 19.0481 15.0822 19.0344 15.2391C18.9972 15.6406 18.9153 16.0108 18.7153 16.3579C18.5823 16.5886 18.4149 16.7982 18.2177 16.9782C17.92 17.2505 17.574 17.4056 17.1916 17.5209C16.8307 17.6289 16.3814 17.7176 15.8493 17.8209L15.7805 17.8348C15.4177 17.9059 15.0884 17.9705 14.813 17.9917C14.5181 18.0148 14.1851 17.9991 13.867 17.8209C13.679 17.715 13.5135 17.5739 13.3795 17.4056C13.1591 17.1249 13.0856 16.8056 13.054 16.5102C13.0233 16.2333 13.0233 15.8899 13.0233 15.5059V10.6726C13.0233 10.3459 13.0233 10.0523 13.0465 9.8114C13.0716 9.55386 13.1302 9.27601 13.3005 9.01847C13.4409 8.80617 13.6298 8.62893 13.8521 8.50155C14.1265 8.34463 14.413 8.30955 14.6707 8.3077C14.9098 8.30586 15.1963 8.33447 15.5088 8.36493L15.574 8.3714C16.1191 8.42401 16.5777 8.46924 16.9488 8.54216C17.2037 8.59201 17.4447 8.66032 17.6707 8.76832C17.6086 6.79061 16.7732 4.91452 15.3415 3.53735C13.9097 2.16017 11.994 1.39004 10 1.39004C8.00599 1.39004 6.09027 2.16017 4.65852 3.53735C3.22676 4.91452 2.39139 6.79061 2.3293 8.76832C2.55535 8.66032 2.79628 8.59293 3.05116 8.54216C3.42326 8.46924 3.88093 8.42493 4.42605 8.3714L4.49116 8.36493C4.80372 8.33447 5.09023 8.30586 5.32837 8.3077C5.58698 8.30955 5.87349 8.34463 6.14698 8.50155C6.37023 8.62893 6.55907 8.80617 6.69953 9.01847C6.86977 9.27694 6.92744 9.55386 6.95349 9.8114C6.97674 10.0514 6.97674 10.3459 6.97674 10.6726V15.5059C6.97674 15.8899 6.97674 16.2323 6.94698 16.5102C6.91442 16.8056 6.84093 17.1249 6.62046 17.4056C6.48653 17.5739 6.321 17.715 6.13302 17.8209C5.81488 17.9991 5.48186 18.0148 5.18605 17.9917C4.86101 17.9563 4.53808 17.9039 4.2186 17.8348L4.1507 17.8209C3.6186 17.7176 3.1693 17.6289 2.80837 17.5209C2.42605 17.4056 2.08 17.2505 1.78233 16.9782C1.58527 16.798 1.4174 16.5888 1.28465 16.3579C1.08465 16.0108 1.00372 15.6406 0.965582 15.2391C0.950966 15.0687 0.941659 14.8978 0.937674 14.7268C0.832261 14.7651 0.719084 14.7776 0.607756 14.7633C0.496427 14.7489 0.390234 14.7081 0.298194 14.6443C0.206154 14.5805 0.130986 14.4956 0.0790728 14.3969C0.0271594 14.2981 3.40124e-05 14.1883 0 14.0769V12.2308C1.58895e-05 12.12 0.0268063 12.0109 0.0781222 11.9126C0.129438 11.8142 0.203782 11.7295 0.294912 11.6656C0.386043 11.6017 0.4913 11.5603 0.601849 11.5451C0.712397 11.5299 0.825009 11.5413 0.930233 11.5782V9.00001ZM2.32558 13.7936C2.32558 14.3954 2.32558 14.7997 2.35535 15.1108C2.38326 15.4117 2.43349 15.5631 2.49488 15.6702C2.55938 15.7797 2.6369 15.8763 2.72744 15.96C2.81302 16.0385 2.93953 16.1133 3.21302 16.1954C3.49954 16.2822 3.88 16.3569 4.45302 16.4696C4.86419 16.5499 5.11349 16.5969 5.29581 16.6117C5.34868 16.6179 5.4021 16.6175 5.45488 16.6108C5.47947 16.5952 5.50144 16.5759 5.52 16.5536C5.54269 16.4922 5.55586 16.4278 5.55907 16.3625C5.58047 16.1677 5.5814 15.9009 5.5814 15.4708V10.7031C5.5814 10.3357 5.5814 10.1114 5.56465 9.94617C5.56165 9.88902 5.55102 9.83253 5.53302 9.77817C5.51234 9.74883 5.48612 9.72375 5.45581 9.70432C5.41079 9.69555 5.36495 9.69153 5.31907 9.69232C5.07747 9.69981 4.83632 9.71767 4.59628 9.74586C4.0093 9.80309 3.61953 9.84186 3.32186 9.90094C3.03814 9.95632 2.90605 10.0191 2.81767 10.0856C2.68744 10.1825 2.57581 10.3071 2.49209 10.4548C2.43256 10.56 2.38233 10.7114 2.35535 11.0169C2.32651 11.3317 2.32558 11.7416 2.32558 12.3489V13.7936ZM17.6744 12.3489C17.6744 11.7416 17.6744 11.3317 17.6447 11.0169C17.6167 10.7123 17.5674 10.56 17.5079 10.4539C17.4262 10.3098 17.3153 10.1841 17.1823 10.0846C17.094 10.0191 16.9619 9.95632 16.6781 9.90001C16.3805 9.84186 15.9907 9.80309 15.4037 9.74586C15.1637 9.71767 14.9225 9.69981 14.6809 9.69232C14.6351 9.69122 14.5892 9.69494 14.5442 9.7034C14.5138 9.7231 14.4876 9.7485 14.467 9.77817C14.4491 9.83223 14.4384 9.88841 14.4353 9.94524C14.4195 10.1114 14.4186 10.3357 14.4186 10.7022V15.4708C14.4186 15.9009 14.4195 16.1677 14.4409 16.3616C14.444 16.4272 14.4572 16.4919 14.48 16.5536C14.4998 16.5782 14.5216 16.5973 14.5451 16.6108C14.56 16.6136 14.6047 16.62 14.7033 16.6108C14.8874 16.5969 15.1358 16.5499 15.547 16.4696C16.12 16.3569 16.5005 16.2822 16.787 16.1954C17.0605 16.1133 17.187 16.0385 17.2726 15.96C17.3631 15.8763 17.4406 15.7797 17.5051 15.6702C17.5665 15.5622 17.6167 15.4117 17.6447 15.1108C17.6735 14.7988 17.6744 14.3954 17.6744 13.7936V12.3489Z" fill="currentColor"></path> </svg>
          <span>Support</span>
        </a>
        <div className="flex items-center gap-1 text-blue-600 cursor-pointer transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M16.2 2.7H7.992L7.2 0H1.8C0.81 0 0 0.81 0 1.8V13.5C0 14.49 0.81 15.3 1.8 15.3H8.1L9 18H16.2C17.19 18 18 17.19 18 16.2V4.5C18 3.51 17.19 2.7 16.2 2.7ZM4.653 11.331C2.628 11.331 0.972 9.684 0.972 7.65C0.972 5.616 2.619 3.969 4.653 3.969C5.589 3.969 6.444 4.302 7.119 4.932L7.182 4.986L6.075 6.048L6.021 6.003C5.76 5.76 5.319 5.472 4.653 5.472C3.474 5.472 2.511 6.453 2.511 7.65C2.511 8.847 3.474 9.828 4.653 9.828C5.886 9.828 6.417 9.045 6.561 8.514H4.572V7.119H8.127L8.136 7.182C8.172 7.371 8.181 7.542 8.181 7.731C8.181 9.846 6.732 11.331 4.653 11.331ZM10.08 9.792C10.377 10.332 10.746 10.854 11.151 11.322L10.665 11.799L10.08 9.792ZM10.773 9.108H9.882L9.603 8.172H13.194C13.194 8.172 12.888 9.351 11.79 10.638C11.322 10.08 10.989 9.531 10.773 9.108ZM17.1 16.2C17.1 16.695 16.695 17.1 16.2 17.1H9.9L11.7 15.3L10.971 12.807L11.799 11.979L14.211 14.4L14.868 13.743L12.429 11.331C13.239 10.404 13.869 9.306 14.157 8.172H15.3V7.236H12.024V6.3H11.088V7.236H9.324L8.262 3.6H16.2C16.695 3.6 17.1 4.005 17.1 4.5V16.2Z" fill="currentColor"></path></svg>
         <span>English</span>
        </div>
      </div>
    </div>
  );
}