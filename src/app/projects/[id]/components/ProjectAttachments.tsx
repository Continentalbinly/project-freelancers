"use client";
import ProposalImage from "@/app/utils/proposalImageHandler";

export default function ProjectAttachments({ attachments, t }: any) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold   mb-3">
        {t("projectDetail.attachments")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((file: any, index: number) => (
          <div key={index} className="flex flex-col">
            <ProposalImage
              src={file.url}
              alt={file.name || `${t("projectDetail.attachment")} ${index + 1}`}
              proposalTitle={
                file.name || `${t("projectDetail.attachment")} ${index + 1}`
              }
              type="attachment"
              size="md"
              className="w-full h-32 object-cover rounded-lg"
            />
            <p className="text-sm text-text-secondary mt-2 text-center">
              {file.name || `${t("projectDetail.attachment")} ${index + 1}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
