import { fireSwal } from "./swalHelpers";

const DEFAULT_OPTIONS = {
  confirmButtonColor: "#0096D6",
  cancelButtonColor: "#6c757d",
  showCancelButton: true,
};

export async function confirmAdminAction({
  title = "Are you sure?",
  text = "",
  html,
  icon = "question",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
} = {}) {
  const result = await fireSwal({
    ...DEFAULT_OPTIONS,
    icon,
    title,
    ...(html ? { html } : { text }),
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed;
}
