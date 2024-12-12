# LearnConnect Backend

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
