import Swal from "sweetalert2";

const DEFAULT_OPTIONS = {
  confirmButtonColor: "#0096D6",
  cancelButtonColor: "#6c757d",
  showCancelButton: true,
};

export async function confirmAdminAction({
  title = "Are you sure?",
  text = "",
  icon = "question",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
} = {}) {
  const result = await Swal.fire({
    ...DEFAULT_OPTIONS,
    icon,
    title,
    text,
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed;
}
