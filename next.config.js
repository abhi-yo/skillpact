/** @type {import('next').NextConfig} */
const nextConfig = {
            // Add any custom Next.js configurations here if needed in the future
        // For now, an empty object is fine.
    reactStrictMode: true, // Example: enabling strict mode
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                // You might need to adjust port and pathname if URLs vary more
                // port: '',
                // pathname: '/a/**', 
            },
            // Add other allowed image hostnames here if needed
        ],
    },
};
  
export default nextConfig;