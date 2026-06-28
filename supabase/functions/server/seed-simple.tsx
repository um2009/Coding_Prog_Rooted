import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple seed that works with UUID auto-generation
export async function seedSimple() {
  console.log('🌱 Starting simple database seed...');
  
  try {
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('bookmarks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Don't delete from users table - we're using auth.users instead
    
    // Create demo user in Supabase Auth first
    console.log('👤 Creating demo user in Supabase Auth...');
    let demoUserId: string;
    
    try {
      // Try to create demo user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'demo@rooted.com',
        password: 'demo123',
        email_confirm: true,
        user_metadata: { name: 'Demo User' }
      });
      
      if (authError) {
        // If user already exists, try to get their ID
        console.log('⚠️ Demo user may already exist, attempting to find...');
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const existingDemoUser = users?.find(u => u.email === 'demo@rooted.com');
        
        if (existingDemoUser) {
          demoUserId = existingDemoUser.id;
          console.log('✅ Found existing demo user:', demoUserId);
        } else {
          throw new Error('Failed to create or find demo user');
        }
      } else {
        demoUserId = authData.user.id;
        console.log('✅ Created demo user in Auth:', demoUserId);
      }
    } catch (authErr) {
      console.error('❌ Auth error:', authErr);
      // Generate a random UUID for demo user if auth fails
      demoUserId = crypto.randomUUID();
      console.log('⚠️ Using generated UUID for demo user:', demoUserId);
    }
    
    // DON'T seed users table - we're using auth.users instead
    console.log('✅ Skipping users table (using auth.users)');
    
    // Seed 40 comprehensive businesses (NO reviews/ratings yet)
    console.log('🏪 Seeding 40 businesses...');
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .insert([
        {
          name: "Green Leaf Café",
          category: "Café",
          district: "Downtown",
          description: "Cozy neighborhood café serving organic coffee and fresh pastries.",
          price_range: "$$",
          hours: "Mon-Fri: 7am-7pm, Sat-Sun: 8am-6pm",
          address: "123 Main St, Brookhaven",
          phone: "(555) 123-4567",
          website: "greenleafcafe.com",
          image_url: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800",
          map_coordinate: { x: 150, y: 200 }
        },
        {
          name: "Brookhaven Bakery",
          category: "Bakery",
          district: "Downtown",
          description: "Artisan bakery with fresh bread, pastries, and custom cakes.",
          price_range: "$$",
          hours: "Tue-Sat: 6am-3pm, Sun: 7am-2pm",
          address: "456 Oak Ave, Brookhaven",
          phone: "(555) 234-5678",
          website: "brookhavenbakery.com",
          image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
          map_coordinate: { x: 250, y: 150 }
        },
        {
          name: "The Book Nook",
          category: "Bookstore",
          district: "Arts Quarter",
          description: "Independent bookstore with curated selection and cozy reading nooks.",
          price_range: "$$",
          hours: "Mon-Sat: 10am-8pm, Sun: 11am-6pm",
          address: "789 Elm St, Brookhaven",
          phone: "(555) 345-6789",
          website: "booknook.com",
          image_url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800",
          map_coordinate: { x: 180, y: 250 }
        },
        {
          name: "Sunrise Yoga Studio",
          category: "Fitness",
          district: "Riverside",
          description: "Welcoming yoga studio offering classes for all levels.",
          price_range: "$$",
          hours: "Mon-Sun: 6am-9pm",
          address: "321 Maple Dr, Brookhaven",
          phone: "(555) 456-7890",
          website: "sunriseyoga.com",
          image_url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800",
          map_coordinate: { x: 320, y: 180 }
        },
        {
          name: "Pasta Paradise",
          category: "Restaurant",
          district: "Little Italy",
          description: "Family-owned Italian restaurant with homemade pasta.",
          price_range: "$$$",
          hours: "Tue-Sun: 11am-10pm",
          address: "654 Pine St, Brookhaven",
          phone: "(555) 567-8901",
          website: "pastaparadise.com",
          image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
          map_coordinate: { x: 200, y: 300 }
        },
        {
          name: "Bloom Florist",
          category: "Florist",
          district: "Garden District",
          description: "Fresh flowers and custom arrangements for every occasion.",
          price_range: "$$",
          hours: "Mon-Sat: 9am-6pm",
          address: "987 Cedar Ln, Brookhaven",
          phone: "(555) 678-9012",
          website: "bloomflorist.com",
          image_url: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800",
          map_coordinate: { x: 270, y: 210 }
        },
        {
          name: "Tech Haven",
          category: "Electronics",
          district: "Tech Plaza",
          description: "Local electronics store with expert repair services.",
          price_range: "$$$",
          hours: "Mon-Sat: 10am-7pm, Sun: 12pm-5pm",
          address: "147 Birch Rd, Brookhaven",
          phone: "(555) 789-0123",
          website: "techhaven.com",
          image_url: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800",
          map_coordinate: { x: 300, y: 140 }
        },
        {
          name: "Pet Paradise",
          category: "Pet Store",
          district: "Westside",
          description: "Full-service pet store with grooming and adoption services.",
          price_range: "$$",
          hours: "Mon-Sat: 9am-7pm, Sun: 10am-6pm",
          address: "258 Willow Way, Brookhaven",
          phone: "(555) 890-1234",
          website: "petparadise.com",
          image_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
          map_coordinate: { x: 350, y: 220 }
        },
        {
          name: "Mountain Gear Outfitters",
          category: "Outdoor",
          district: "Northside",
          description: "Outdoor gear and equipment for all your adventures.",
          price_range: "$$$",
          hours: "Mon-Sat: 10am-8pm, Sun: 11am-6pm",
          address: "369 Spruce St, Brookhaven",
          phone: "(555) 901-2345",
          website: "mountaingear.com",
          image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
          map_coordinate: { x: 240, y: 100 }
        },
        {
          name: "Fresh & Local Market",
          category: "Grocery",
          district: "Garden District",
          description: "Organic grocery store featuring local farmers and producers.",
          price_range: "$$$",
          hours: "Mon-Sun: 8am-9pm",
          address: "741 Ash Ave, Brookhaven",
          phone: "(555) 012-3456",
          website: "freshandlocal.com",
          image_url: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=800",
          map_coordinate: { x: 280, y: 120 }
        },
        {
          name: "Brew Masters Coffee",
          category: "Café",
          district: "Downtown",
          description: "Specialty coffee roasters with expert baristas.",
          price_range: "$$",
          hours: "Mon-Fri: 6am-8pm, Sat-Sun: 7am-7pm",
          address: "852 Hickory Ln, Brookhaven",
          phone: "(555) 123-9876",
          website: "brewmasters.com",
          image_url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
          map_coordinate: { x: 160, y: 190 }
        },
        {
          name: "Handmade Haven",
          category: "Crafts",
          district: "Arts Quarter",
          description: "Unique handcrafted items from local artisans.",
          price_range: "$$",
          hours: "Tue-Sat: 10am-6pm, Sun: 12pm-5pm",
          address: "963 Poplar Pl, Brookhaven",
          phone: "(555) 234-8765",
          website: "handmadehaven.com",
          image_url: "https://images.unsplash.com/photo-1606498931267-20a27e55d2c9?w=800",
          map_coordinate: { x: 190, y: 270 }
        },
        {
          name: "The Vinyl Vault",
          category: "Music",
          district: "Arts Quarter",
          description: "Vintage and new vinyl records, plus music accessories.",
          price_range: "$$",
          hours: "Mon-Sat: 11am-8pm, Sun: 12pm-6pm",
          address: "159 Chestnut St, Brookhaven",
          phone: "(555) 345-7654",
          website: "vinylvault.com",
          image_url: "https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800",
          map_coordinate: { x: 220, y: 280 }
        },
        {
          name: "Wellness Spa",
          category: "Spa",
          district: "Riverside",
          description: "Relaxing spa treatments and massage therapy.",
          price_range: "$$$",
          hours: "Mon-Sat: 9am-8pm, Sun: 10am-6pm",
          address: "357 Sycamore Dr, Brookhaven",
          phone: "(555) 456-6543",
          website: "wellnessspa.com",
          image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
          map_coordinate: { x: 330, y: 190 }
        },
        {
          name: "Kids' Corner Toys",
          category: "Toys",
          district: "Westside",
          description: "Educational and fun toys for children of all ages.",
          price_range: "$$",
          hours: "Mon-Sat: 10am-7pm, Sun: 11am-5pm",
          address: "753 Magnolia Ave, Brookhaven",
          phone: "(555) 567-5432",
          website: "kidscorner.com",
          image_url: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800",
          map_coordinate: { x: 360, y: 230 }
        },
        {
          name: "Garden Grove Nursery",
          category: "Garden",
          district: "Garden District",
          description: "Plants, seeds, and gardening supplies with expert advice.",
          price_range: "$$",
          hours: "Mon-Sat: 8am-6pm, Sun: 9am-5pm",
          address: "951 Dogwood Ct, Brookhaven",
          phone: "(555) 678-4321",
          website: "gardengrove.com",
          image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800",
          map_coordinate: { x: 290, y: 130 }
        },
        {
          name: "Frame It Art Gallery",
          category: "Art",
          district: "Arts Quarter",
          description: "Local art gallery featuring regional artists and custom framing.",
          price_range: "$$$",
          hours: "Tue-Sat: 11am-7pm, Sun: 12pm-5pm",
          address: "842 Redwood Rd, Brookhaven",
          phone: "(555) 789-3210",
          website: "frameit.com",
          image_url: "https://images.unsplash.com/photo-1577720643272-265f08fd6197?w=800",
          map_coordinate: { x: 210, y: 260 }
        },
        {
          name: "Slice of Heaven Pizza",
          category: "Restaurant",
          district: "Little Italy",
          description: "Wood-fired pizza with creative toppings and craft beer.",
          price_range: "$$",
          hours: "Mon-Thu: 11am-10pm, Fri-Sat: 11am-11pm, Sun: 12pm-9pm",
          address: "246 Beech Blvd, Brookhaven",
          phone: "(555) 890-2109",
          website: "sliceofheaven.com",
          image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
          map_coordinate: { x: 190, y: 310 }
        },
        {
          name: "The Daily Grind",
          category: "Café",
          district: "University District",
          description: "Student-friendly café with late hours and study spaces.",
          price_range: "$",
          hours: "Mon-Sun: 6am-11pm",
          address: "112 College Ave, Brookhaven",
          phone: "(555) 234-5670",
          website: "dailygrind.com",
          image_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
          map_coordinate: { x: 140, y: 160 }
        },
        {
          name: "Iron & Strength Gym",
          category: "Fitness",
          district: "Industrial District",
          description: "Full-service gym with personal training and group classes.",
          price_range: "$$",
          hours: "Mon-Sun: 5am-11pm",
          address: "445 Factory Rd, Brookhaven",
          phone: "(555) 345-6781",
          website: "ironstrength.com",
          image_url: "https://images.unsplash.com/photo-1623874514711-0f321325f318?w=800",
          map_coordinate: { x: 120, y: 290 }
        },
        {
          name: "Burger Bliss",
          category: "Restaurant",
          district: "Downtown",
          description: "Gourmet burgers made with locally sourced beef and creative toppings.",
          price_range: "$$",
          hours: "Mon-Sun: 11am-10pm",
          address: "223 Main St, Brookhaven",
          phone: "(555) 456-7892",
          website: "burgerbliss.com",
          image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
          map_coordinate: { x: 170, y: 210 }
        },
        {
          name: "Zen Meditation Center",
          category: "Wellness",
          district: "Riverside",
          description: "Peaceful meditation center offering guided sessions and workshops.",
          price_range: "$",
          hours: "Mon-Sat: 7am-8pm",
          address: "567 River Rd, Brookhaven",
          phone: "(555) 567-8903",
          website: "zenmeditation.com",
          image_url: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800",
          map_coordinate: { x: 310, y: 170 }
        },
        {
          name: "Vintage Threads",
          category: "Clothing",
          district: "Arts Quarter",
          description: "Curated vintage clothing and accessories from every era.",
          price_range: "$$",
          hours: "Tue-Sat: 11am-7pm, Sun: 12pm-5pm",
          address: "890 Fashion Ave, Brookhaven",
          phone: "(555) 678-9014",
          website: "vintagethreads.com",
          image_url: "https://images.unsplash.com/photo-1558769132-cb1aea1f5de8?w=800",
          map_coordinate: { x: 230, y: 290 }
        },
        {
          name: "Sushi Zen",
          category: "Restaurant",
          district: "Downtown",
          description: "Traditional Japanese sushi and sashimi with fresh daily catches.",
          price_range: "$$$",
          hours: "Tue-Sun: 12pm-10pm",
          address: "334 Market St, Brookhaven",
          phone: "(555) 789-0125",
          website: "sushizen.com",
          image_url: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800",
          map_coordinate: { x: 165, y: 215 }
        },
        {
          name: "Paws & Claws Veterinary",
          category: "Veterinary",
          district: "Westside",
          description: "Compassionate veterinary care for all your pets.",
          price_range: "$$$",
          hours: "Mon-Fri: 8am-6pm, Sat: 9am-4pm",
          address: "445 Animal Way, Brookhaven",
          phone: "(555) 890-1236",
          website: "pawsclaws.com",
          image_url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
          map_coordinate: { x: 370, y: 240 }
        },
        {
          name: "The Sweet Spot",
          category: "Dessert",
          district: "Downtown",
          description: "Ice cream, gelato, and desserts made fresh daily.",
          price_range: "$",
          hours: "Mon-Thu: 12pm-9pm, Fri-Sun: 12pm-11pm",
          address: "556 Sugar Lane, Brookhaven",
          phone: "(555) 901-2347",
          website: "sweetspot.com",
          image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800",
          map_coordinate: { x: 155, y: 205 }
        },
        {
          name: "Harmony Music School",
          category: "Education",
          district: "Arts Quarter",
          description: "Music lessons for all ages and instruments.",
          price_range: "$$",
          hours: "Mon-Sat: 9am-8pm",
          address: "667 Melody Dr, Brookhaven",
          phone: "(555) 012-3458",
          website: "harmonymusic.com",
          image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
          map_coordinate: { x: 240, y: 275 }
        },
        {
          name: "Craft Beer Collective",
          category: "Bar",
          district: "Industrial District",
          description: "Local craft brewery with rotating taps and food trucks.",
          price_range: "$$",
          hours: "Mon-Thu: 4pm-11pm, Fri-Sun: 12pm-1am",
          address: "778 Brewery St, Brookhaven",
          phone: "(555) 123-4569",
          website: "craftbeercollective.com",
          image_url: "https://images.unsplash.com/photo-1532634993-15f421e42ec0?w=800",
          map_coordinate: { x: 130, y: 300 }
        },
        {
          name: "Sunrise Farmers Market",
          category: "Market",
          district: "Garden District",
          description: "Weekend farmers market with local produce, crafts, and live music.",
          price_range: "$",
          hours: "Sat-Sun: 7am-2pm",
          address: "889 Market Square, Brookhaven",
          phone: "(555) 234-5671",
          website: "sunrisefarmersmarket.com",
          image_url: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800",
          map_coordinate: { x: 295, y: 125 }
        },
        {
          name: "The Barber Shop",
          category: "Salon",
          district: "Downtown",
          description: "Classic barber shop offering haircuts, shaves, and grooming.",
          price_range: "$$",
          hours: "Tue-Sat: 9am-7pm",
          address: "990 Shave St, Brookhaven",
          phone: "(555) 345-6782",
          website: "thebarbershop.com",
          image_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
          map_coordinate: { x: 175, y: 195 }
        },
        {
          name: "Moonlight Cinema",
          category: "Entertainment",
          district: "Downtown",
          description: "Independent cinema showing art house and classic films.",
          price_range: "$$",
          hours: "Mon-Sun: 12pm-11pm",
          address: "101 Theater Way, Brookhaven",
          phone: "(555) 456-7893",
          website: "moonlightcinema.com",
          image_url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800",
          map_coordinate: { x: 185, y: 220 }
        },
        {
          name: "Thai Orchid",
          category: "Restaurant",
          district: "University District",
          description: "Authentic Thai cuisine with vegetarian and vegan options.",
          price_range: "$$",
          hours: "Mon-Sun: 11am-10pm",
          address: "212 Campus Dr, Brookhaven",
          phone: "(555) 567-8904",
          website: "thaiorchid.com",
          image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
          map_coordinate: { x: 145, y: 165 }
        },
        {
          name: "Cycle Revolution",
          category: "Sports",
          district: "Northside",
          description: "Bicycle sales, repairs, and accessories for all riders.",
          price_range: "$$$",
          hours: "Mon-Sat: 10am-7pm, Sun: 11am-5pm",
          address: "323 Bike Lane, Brookhaven",
          phone: "(555) 678-9015",
          website: "cyclerevolution.com",
          image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
          map_coordinate: { x: 250, y: 95 }
        },
        {
          name: "Little Learners Daycare",
          category: "Childcare",
          district: "Westside",
          description: "Nurturing childcare with educational programs for ages 0-5.",
          price_range: "$$$",
          hours: "Mon-Fri: 7am-6pm",
          address: "434 Playground Ave, Brookhaven",
          phone: "(555) 789-0126",
          website: "littlelearners.com",
          image_url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
          map_coordinate: { x: 380, y: 250 }
        },
        {
          name: "The Cozy Corner Café",
          category: "Café",
          district: "Riverside",
          description: "Neighborhood café with homemade soups, sandwiches, and wifi.",
          price_range: "$",
          hours: "Mon-Fri: 7am-6pm, Sat-Sun: 8am-5pm",
          address: "545 Comfort St, Brookhaven",
          phone: "(555) 890-1237",
          website: "cozycorner.com",
          image_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
          map_coordinate: { x: 325, y: 175 }
        },
        {
          name: "Hometown Hardware",
          category: "Hardware",
          district: "Industrial District",
          description: "Family-owned hardware store with knowledgeable staff.",
          price_range: "$$",
          hours: "Mon-Sat: 8am-7pm, Sun: 9am-5pm",
          address: "656 Tool Ave, Brookhaven",
          phone: "(555) 901-2348",
          website: "hometownhardware.com",
          image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
          map_coordinate: { x: 125, y: 305 }
        },
        {
          name: "Brushstrokes Art Studio",
          category: "Art",
          district: "Arts Quarter",
          description: "Art classes and workshops for adults and children.",
          price_range: "$$",
          hours: "Tue-Sat: 10am-8pm, Sun: 12pm-6pm",
          address: "767 Canvas Rd, Brookhaven",
          phone: "(555) 012-3459",
          website: "brushstrokes.com",
          image_url: "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=800",
          map_coordinate: { x: 225, y: 285 }
        },
        {
          name: "Tacos El Amigo",
          category: "Restaurant",
          district: "Little Mexico",
          description: "Authentic Mexican street tacos and fresh-made tortillas.",
          price_range: "$",
          hours: "Mon-Sun: 10am-11pm",
          address: "878 Salsa St, Brookhaven",
          phone: "(555) 123-4570",
          website: "tacosamigo.com",
          image_url: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800",
          map_coordinate: { x: 205, y: 315 }
        },
        {
          name: "Brookhaven Dental Care",
          category: "Healthcare",
          district: "Medical District",
          description: "Modern dental practice with gentle, family-friendly care.",
          price_range: "$$$",
          hours: "Mon-Fri: 8am-5pm",
          address: "989 Health Plaza, Brookhaven",
          phone: "(555) 234-5672",
          website: "brookhavendental.com",
          image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
          map_coordinate: { x: 260, y: 110 }
        },
        {
          name: "The Comic Book Cave",
          category: "Comics",
          district: "University District",
          description: "Comic books, graphic novels, and collectibles for enthusiasts.",
          price_range: "$$",
          hours: "Mon-Sat: 10am-8pm, Sun: 12pm-6pm",
          address: "100 Hero Way, Brookhaven",
          phone: "(555) 345-6783",
          website: "comicbookcave.com",
          image_url: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?w=800",
          map_coordinate: { x: 150, y: 155 }
        }
      ])
      .select();
    
    if (businessesError) throw businessesError;
    console.log(`✅ Seeded ${businesses?.length} businesses`);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('📝 Note: No reviews or ratings have been added yet. These will be added when demo accounts are created.');
    
    return {
      users: 0, // We're using auth.users, so no users table seeding
      businesses: businesses?.length || 0,
      reviews: 0,
      deals: 0
    };
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}