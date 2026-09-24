import { z } from "zod";

//
export const orderFormSchema = z.object({
  customerName: z.string().min(3).max(50),

  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/),

  address: z.string().min(10).max(300),

  productId: z.string().cuid("Invalid Id"),

  weight: z.enum(["500g", "1kg"], {
    errorMap: () => ({ message: "Please choose correct weight" }),
  }),

  quantity: z
    .number()
    .int("Must be integer")
    .min(1, "minimum one product needs to order")
    .max(5, "Maximum 5 products can take in single order"),
});

//
export type OrderFormInput = z.infer<typeof orderFormSchema>;
