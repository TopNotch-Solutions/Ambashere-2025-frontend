import Swal from "sweetalert2";

/**
 * Close any visible SweetAlert so confirms/success alerts never stack.
 */
export async function closeOpenSwal() {
  if (typeof Swal.isVisible === "function" && Swal.isVisible()) {
    Swal.close();
    // Let the close animation finish before opening the next popup.
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
}

/**
 * Fire a SweetAlert after ensuring any previous one is closed.
 */
export async function fireSwal(options = {}) {
  await closeOpenSwal();
  return Swal.fire(options);
}
