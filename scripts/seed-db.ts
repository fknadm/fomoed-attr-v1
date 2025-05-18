import { db } from '../db'
import { 
  users,
  projects,
  campaigns,
  campaignRequirements,
  creatorProfiles,
  campaignApplications,
  campaignMetrics
} from '../db/schema'
import { nanoid } from 'nanoid'

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const user1Id = nanoid()
  const user2Id = nanoid()
  const user3Id = nanoid()
  
  await db.insert(users).values([
    {
      id: user1Id,
      address: '0x1234567890123456789012345678901234567890',
      username: 'crypto_whale',
      avatar: 'https://avatars.githubusercontent.com/u/1234567',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: user2Id,
      address: '0x2345678901234567890123456789012345678901',
      username: 'nft_creator',
      avatar: 'https://avatars.githubusercontent.com/u/2345678',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: user3Id,
      address: '0x3456789012345678901234567890123456789012',
      username: 'web3_influencer',
      avatar: 'https://avatars.githubusercontent.com/u/3456789',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created users')

  // Create sample projects
  const project1Id = nanoid()
  const project2Id = nanoid()
  
  await db.insert(projects).values([
    {
      id: project1Id,
      name: 'DeFi Protocol',
      description: 'Next-gen decentralized exchange',
      website: 'https://defi-protocol.io',
      twitter: '@defi_protocol',
      discord: 'defi-protocol',
      ownerId: user1Id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: project2Id,
      name: 'NFT Marketplace',
      description: 'Community-driven NFT platform',
      website: 'https://nft-market.io',
      twitter: '@nft_market',
      discord: 'nft-market',
      ownerId: user2Id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created projects')

  // Create sample campaigns
  const campaign1Id = nanoid()
  const campaign2Id = nanoid()
  
  await db.insert(campaigns).values([
    {
      id: campaign1Id,
      projectId: project1Id,
      name: 'DeFi Protocol Launch',
      description: 'Promote our DEX launch',
      budget: '50000',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-07-01'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: campaign2Id,
      projectId: project2Id,
      name: 'NFT Collection Drop',
      description: 'Promote new NFT collection',
      budget: '25000',
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-06-15'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created campaigns')

  // Create campaign requirements
  await db.insert(campaignRequirements).values([
    {
      id: nanoid(),
      campaignId: campaign1Id,
      minFollowers: 10000,
      requiredPlatforms: JSON.stringify(['twitter', 'discord']),
      contentType: 'video',
      deliverables: JSON.stringify(['promotional video', 'twitter thread']),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      campaignId: campaign2Id,
      minFollowers: 5000,
      requiredPlatforms: JSON.stringify(['twitter']),
      contentType: 'post',
      deliverables: JSON.stringify(['twitter thread', 'community AMA']),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created campaign requirements')

  // Create creator profiles
  const creator1Id = nanoid()
  const creator2Id = nanoid()
  
  await db.insert(creatorProfiles).values([
    {
      id: creator1Id,
      userId: user2Id,
      bio: 'NFT artist and crypto enthusiast',
      twitterHandle: '@nft_creator',
      twitterFollowers: 15000,
      discordHandle: 'nft_creator#1234',
      websiteUrl: 'https://nft-creator.io',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: creator2Id,
      userId: user3Id,
      bio: 'Web3 content creator and community builder',
      twitterHandle: '@web3_influencer',
      twitterFollowers: 25000,
      discordHandle: 'web3_influencer#5678',
      websiteUrl: 'https://web3-influencer.io',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created creator profiles')

  // Create campaign applications
  const app1Id = nanoid()
  const app2Id = nanoid()
  
  await db.insert(campaignApplications).values([
    {
      id: app1Id,
      campaignId: campaign1Id,
      creatorId: creator1Id,
      status: 'approved',
      proposal: 'Will create a comprehensive video about the DEX features',
      proposedAmount: '5000',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: app2Id,
      campaignId: campaign2Id,
      creatorId: creator2Id,
      status: 'approved',
      proposal: 'Will create a Twitter thread and host an AMA',
      proposedAmount: '3000',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created campaign applications')

  // Create campaign metrics
  await db.insert(campaignMetrics).values([
    {
      id: nanoid(),
      campaignId: campaign1Id,
      applicationId: app1Id,
      impressions: 50000,
      clicks: 2500,
      conversions: 500,
      engagement: '5.0',
      postUrl: 'https://twitter.com/creator1/status/123456789',
      platform: 'twitter',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      campaignId: campaign2Id,
      applicationId: app2Id,
      impressions: 30000,
      clicks: 1500,
      conversions: 300,
      engagement: '4.8',
      postUrl: 'https://twitter.com/creator2/status/987654321',
      platform: 'twitter',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('✅ Created campaign metrics')

  console.log('✅ Database seeded successfully!')
}

main().catch((error) => {
  console.error('❌ Error seeding database:', error)
  process.exit(1)
}) 