import * as yup from 'yup';

export const walletSetupSchema = yup.object().shape({
  name: yup
    .string()
    .required('Wallet name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  balance: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Initial balance is required')
    .min(0.0001, 'Initial balance must be greater than 0')
    .max(999999999.9999, 'Balance cannot exceed 999,999,999.9999')
    .test(
      'decimal-places',
      'Balance can have up to 4 decimal places',
      (value) => {
        if (!value) return true;
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        return decimalPlaces <= 4;
      }
    )
    .test(
      'is-valid-number',
      'Please enter a valid number',
      (value) => value === undefined || (!isNaN(value) && isFinite(value))
    ),
});
