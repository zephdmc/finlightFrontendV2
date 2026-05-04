// utils/paymentTypeUtils.js
import PaymentTypeService from '../services/PaymentTypeService';

export const getPaymentTypeDisplay = (paymentType) => {
  return PaymentTypeService.formatPaymentType(paymentType);
};

export const validatePaymentType = (paymentTypeData) => {
  return PaymentTypeService.validatePaymentTypeData(paymentTypeData);
};

export const getPaymentTypeSchedule = (paymentType) => {
  if (paymentType.frequency === 'one-time') return 'One-time payment';
  return `Every ${paymentType.duration_value} ${paymentType.duration_unit}`;
};

export const getPaymentTypeColor = (isMandatory) => {
  return isMandatory ? 'red' : 'green';
};