# LearnConnect Backend

  <!-- "postinstall": "npx prisma generate && npx prisma db push --schema prisma/schema.prisma --accept-data-loss || true" -->

wetrocloud
npm run build # Runs tsc to compile to JS
npm run start:dist

<!-- Setting Up Plans In Paystack -->

How to Set Up Paystack Plans
Here’s a step-by-step guide to create the monthly plans in your Paystack dashboard and update your code with the correct plan codes:

Step 1: Create Plans in Paystack Dashboard
Log in to Paystack:
Go to your Paystack dashboard: https://dashboard.paystack.com/.
Log in with your credentials.
Navigate to Plans:
On the left sidebar, click on “Subscriptions” > “Plans”.
Alternatively, go directly to: https://dashboard.paystack.com/#/plans.
Create a New Plan for LOCAL_MONTHLY:
Click the “Create Plan” button.
Fill in the details:
Plan Name: Local Monthly (or a descriptive name like Aligntrait Local Monthly).
Amount: 550000 (in kobo, as per your PRICES for NGN—this is NGN 5,500).
Interval: Monthly (this matches interval: 'monthly' in your code).
Currency: NGN (since your code defaults to NGN unless USD is enabled).
Description (optional): Local Monthly Plan for Aligntrait.
Click “Create Plan”.
After creation, Paystack will assign a plan code (e.g., PLN_abc123). Copy this code.
Create a New Plan for GLOBAL_MONTHLY:
Repeat the process:
Plan Name: Global Monthly.
Amount: 950000 (in kobo, as per your PRICES for NGN—this is NGN 9,500).
Interval: Monthly.
Currency: NGN.
Description (optional): Global Monthly Plan for Aligntrait.
Click “Create Plan”.
Copy the generated plan code (e.g., PLN_def456).
Verify Plans:
Go to the Plans section in your dashboard and confirm both plans are listed with the correct details (amount, interval, currency).
Step 2: Update PAYSTACK_PLAN_CODES in Your Code
Replace the placeholder values in PAYSTACK_PLAN_CODES with the actual plan codes you copied from Paystack:
typescript

Collapse

Wrap

Run

Copy
const PAYSTACK_PLAN_CODES: Record<PaymentPlan, string> = {
BASIC_ONETIME: '', // Not needed for one-time
LOCAL_MONTHLY: 'PLN_abc123', // Replace with the actual code for Local Monthly
GLOBAL_MONTHLY: 'PLN_def456', // Replace with the actual code for Global Monthly
};
Ensure the codes match exactly, as they are case-sensitive.
Step 3: Test the Plans
After updating the plan codes, test the monthly subscription flow:
Initiate a payment for LOCAL_MONTHLY using initializeMonthlySubscription.
Complete the payment and verify the webhook (POST /api/v1/monthly/payment/webhook) processes it successfully.
Check the Paystack dashboard to confirm a subscription is created with the correct plan.
Verify that the subscription_code is stored in the User model.
Step 4: Handle USD Plans (If Applicable)
Your code supports USD payments if process.env.ENABLE_USD === 'true' and the user’s region isn’t Nigeria. If you plan to support USD for monthly plans:
Create separate plans in Paystack for USD:
LOCAL_MONTHLY in USD: $899 (amount: 89900 in cents).
GLOBAL_MONTHLY in USD: $1499 (amount: 149900 in cents).
Update your PAYSTACK_PLAN_CODES to account for currency:
typescript

<!-- Setting Up plan In Paystack -->

"postinstall": "npx prisma generate && npx prisma db push --schema prisma/schema.prisma --accept-data-loss",

<!--  -->

This is the LearnConnect Backend.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

1. `EMAIL_PASS`

   - Description: The password for the email account used for sending emails.

2. `EMAIL_USER`

   - Description: The username (or email address) of the email account used for sending emails.

3. `JWT_SECRET`

   - Description: A secret string used for JWT token encryption. You can generate a secure string on your Linux machine using the command `openssl rand -base64 32`.

4. `DATABASE_URL`
   - Description: A connection URL to a Postgres database.
   - Example: `postgresql://user:password@localhost:5432/mydatabase`

## Usage

Instructions on how to use the project is posted on the documentation on the active [backend link](#)

## Installation

Step-by-step instructions on how to install the project.

```bash
# Install dependencies
npm install

# Run the project
npx prisma db push && npm start
```
