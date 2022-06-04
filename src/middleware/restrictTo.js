const restrictTo = (role, allowedFields) => {
  if (!allowedFields.includes(role)) return false;

  return true;
};

export default restrictTo;
