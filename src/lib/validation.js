/** Validate the site-visit form. Returns { field: message } for every invalid field. */
export function validateVisit({ name, phone, date, slot }, today = new Date()) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Please enter your name.";
  const digits = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(digits)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!date) errors.date = "Choose a date.";
  else {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (new Date(`${date}T00:00:00`) < start) errors.date = "Pick today or a future date.";
  }
  if (!slot) errors.slot = "Choose a time slot.";
  return errors;
}
