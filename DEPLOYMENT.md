# Deploy Your App in 5 Minutes

Just follow these steps and you'll have your skillexchange app live on the internet.

## What You Need

- Your code on GitHub
- Google OAuth stuff (you already have this)

## Step 1: Database

Go to Railway.app, sign up, create a new project. Add PostgreSQL. Done.

## Step 2: API Server

In the same Railway project, create another service. Point it to your GitHub repo, set the root directory to `apps/api`. Railway will build and deploy it automatically.

## Step 3: Chat Server

Create one more Railway service. Same repo, but root directory is `apps/web`. Set the start command to run your socket server.

## Step 4: Frontend

Go to Vercel.com, connect your GitHub repo. Set root directory to `apps/web`. Deploy. That's it.

## Step 5: Environment Variables

Copy your database URL from Railway and paste it into both Railway services and Vercel. Add your Google OAuth keys to Vercel. Set the API and chat URLs in Vercel so your frontend knows where to connect.

## Step 6: Database Setup

Connect to your Railway database and run `npx prisma migrate deploy` to set up your tables.

That's literally it. Your app is now live on the internet. Railway handles the backend stuff, Vercel handles the frontend. Both scale automatically and give you HTTPS for free.

Cost: Around $20/month total for a production app that can handle thousands of users.
