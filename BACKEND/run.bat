@echo off
set /p DB_URL=<.env.tmp
set /p DB_USERNAME=<.env.tmp
set /p DB_PASSWORD=<.env.tmp
set /p AWS_S3_BUCKET_NAME=<.env.tmp
set /p AWS_S3_REGION=<.env.tmp
set /p AWS_ACCESS_KEY_ID=<.env.tmp
set /p AWS_SECRET_ACCESS_KEY=<.env.tmp
set /p RAZORPAY_API_KEY=<.env.tmp
set /p RAZORPAY_API_SECRET=<.env.tmp
set /p JWT_SECRET_KEY=<.env.tmp
set /p SERVER_PORT=<.env.tmp

findstr /b "DB_URL=" .env > .env.tmp
set /p DB_URL=<.env.tmp
set DB_URL=%DB_URL:~7%

findstr /b "DB_USERNAME=" .env > .env.tmp
set /p DB_USERNAME=<.env.tmp
set DB_USERNAME=%DB_USERNAME:~12%

findstr /b "DB_PASSWORD=" .env > .env.tmp
set /p DB_PASSWORD=<.env.tmp
set DB_PASSWORD=%DB_PASSWORD:~12%

findstr /b "AWS_S3_BUCKET_NAME=" .env > .env.tmp
set /p AWS_S3_BUCKET_NAME=<.env.tmp
set AWS_S3_BUCKET_NAME=%AWS_S3_BUCKET_NAME:~18%

findstr /b "AWS_S3_REGION=" .env > .env.tmp
set /p AWS_S3_REGION=<.env.tmp
set AWS_S3_REGION=%AWS_S3_REGION:~14%

findstr /b "AWS_ACCESS_KEY_ID=" .env > .env.tmp
set /p AWS_ACCESS_KEY_ID=<.env.tmp
set AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID:~17%

findstr /b "AWS_SECRET_ACCESS_KEY=" .env > .env.tmp
set /p AWS_SECRET_ACCESS_KEY=<.env.tmp
set AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY:~21%

findstr /b "RAZORPAY_API_KEY=" .env > .env.tmp
set /p RAZORPAY_API_KEY=<.env.tmp
set RAZORPAY_API_KEY=%RAZORPAY_API_KEY:~17%

findstr /b "RAZORPAY_API_SECRET=" .env > .env.tmp
set /p RAZORPAY_API_SECRET=<.env.tmp
set RAZORPAY_API_SECRET=%RAZORPAY_API_SECRET:~20%

findstr /b "JWT_SECRET_KEY=" .env > .env.tmp
set /p JWT_SECRET_KEY=<.env.tmp
set JWT_SECRET_KEY=%JWT_SECRET_KEY:~14%

findstr /b "SERVER_PORT=" .env > .env.tmp
set /p SERVER_PORT=<.env.tmp
set SERVER_PORT=%SERVER_PORT:~12%

del .env.tmp

echo Starting application with environment variables...
mvnw spring-boot:run 