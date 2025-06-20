/** @type {import('next').NextConfig} */
const nextConfig = {
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