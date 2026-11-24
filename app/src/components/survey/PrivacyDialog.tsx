"use client";

import { useEffect, useRef } from "react";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading, Text } from "@astryxdesign/core/Text";
import { PRIVACY_NOTICE_VERSION } from "@/lib/survey-config";

interface PrivacyDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export function PrivacyDialog({
  triggerLabel = "Privacy Notice (RA 10173)",
  triggerClassName,
}: PrivacyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      let pressedOutside = false;
      const onDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
      };
      dialog.addEventListener("pointerdown", onDown);
      dialog.addEventListener("pointerup", onUp);
      return () => {
        dialog.removeEventListener("pointerdown", onDown);
        dialog.removeEventListener("pointerup", onUp);
      };
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={
          triggerClassName ??
          "underline underline-offset-4 font-medium text-[#C44114] hover:text-[#18191C] transition-colors cursor-pointer"
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        {...({ closedby: "any" } as Record<string, string>)}
        aria-labelledby="privacy-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-[4px] border border-[#18191C] bg-[#FFFFFF] p-0 text-[#18191C] shadow-2xl backdrop:bg-[#121316]/65"
      >
        <div className="bg-[#18191C] px-6 py-4 flex items-center justify-between gap-4 text-[#F5F4F0]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#F47B4F]">
              Republic Act No. 10173 · {PRIVACY_NOTICE_VERSION}
            </span>
            <Heading level={1} id="privacy-dialog-title" className="text-[#F5F4F0] mt-0.5">
              Privacy Notice
            </Heading>
          </div>
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              className="rounded-[4px] border border-[#4B4F5B] bg-[#23252C] px-3 py-1.5 text-xs font-medium text-[#F5F4F0] hover:border-[#F47B4F] transition-colors cursor-pointer"
            >
              Close
            </button>
          </form>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3 text-sm leading-relaxed text-[#555963]">
            <p>
              <strong className="text-[#18191C]">Purpose of collection:</strong> Your
              responses are used exclusively for market research to understand how service
              professionals prepare portfolios, presentations, and proposals.
            </p>
            <p>
              <strong className="text-[#18191C]">Data minimization:</strong> Survey answers
              are stored anonymously without personal identifiers. We do not log or persist
              respondent IP addresses in our database.
            </p>
            <p>
              <strong className="text-[#18191C]">Separated follow-up contacts:</strong> If
              you opt into a follow-up interview or early product test, your optional name
              and contact details are saved in a separate database table unlinked from your
              survey responses and only with your explicit consent.
            </p>
            <p>
              <strong className="text-[#18191C]">Retention &amp; deletion rights:</strong>{" "}
              Optional follow-up contact records are deleted after the research and early
              prototype testing phase concludes, or immediately upon request.
            </p>
          </div>

          <Divider />

          <Text type="supporting" color="secondary">
            Need a record deleted? Reach out via the contact channel shared in your survey
            invitation.
          </Text>
        </div>
      </dialog>
    </>
  );
}
