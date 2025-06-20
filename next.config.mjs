/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'toppng.com',
        pathname: '/**',
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'kerberos': false,
        'dns': false,
        'net': false,
        'tls': false,
        'fs': false,
        'aws4': false,
        'mock-aws-s3': false,
        'nock': false,
        'dns2': false,
        'snappy': false,
        '@node-rs/snappy': false,
        '@node-rs/crc32': false,
        'lz4': false,
        'zstd': false
      }
    }

    // Ignore native addons
    config.externals = [...(config.externals || []), { 'kerberos': 'kerberos' }]

    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/cassandra-driver/ },
      { module: /node_modules\/kerberos/ }
    ]

    return config
  }
};

export default nextConfig; 