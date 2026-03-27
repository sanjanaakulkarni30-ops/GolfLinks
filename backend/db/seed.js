import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Charity from '../models/Charity.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        await Charity.deleteMany({});
        console.log('Cleared existing data');

        const adminPassword = await bcrypt.hash('admin123', 12);
        const userPassword = await bcrypt.hash('user123', 12);

        const admin = new User({
            email: 'admin@golfcharity.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            isAdmin: true,
            razorpayCustomerId: 'cus_admin_test'
        });

        const testUser = new User({
            email: 'user@test.com',
            password: userPassword,
            firstName: 'Test',
            lastName: 'User',
            razorpayCustomerId: 'cus_user_test',
            scores: [
                { value: 32, date: new Date('2026-03-20') },
                { value: 28, date: new Date('2026-03-15') },
                { value: 35, date: new Date('2026-03-10') },
                { value: 30, date: new Date('2026-03-05') },
                { value: 33, date: new Date('2026-03-01') }
            ]
        });

        await admin.save();
        await testUser.save();

        const charities = [
            {
                name: 'Children\'s Hospital Foundation',
                description: 'Supporting sick children and their families by funding medical research, purchasing life-saving equipment, and providing comfort programs.',
                website: 'https://childrenshospital.org',
                logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
                category: 'Healthcare',
                registrationNumber: 'CHF-2024-001',
                isFeatured: true,
                totalRaised: 125000,
                totalDonors: 450,
                events: [
                    {
                        title: 'Annual Charity Gala',
                        description: 'Join us for an evening of fundraising and awareness',
                        date: new Date('2026-04-15'),
                        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
                    }
                ]
            },
            {
                name: 'Environmental Conservation Trust',
                description: 'Protecting our planet through conservation efforts, renewable energy projects, and environmental education programs.',
                website: 'https://ecoconservation.org',
                logo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
                category: 'Environment',
                registrationNumber: 'ECT-2024-002',
                totalRaised: 89000,
                totalDonors: 320
            },
            {
                name: 'Education for All Foundation',
                description: 'Providing educational opportunities and resources to underprivileged children around the world.',
                website: 'https://educationforall.org',
                logo: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=400&fit=crop',
                category: 'Education',
                registrationNumber: 'EFA-2024-003',
                totalRaised: 67000,
                totalDonors: 280
            },
            {
                name: 'Animal Rescue Network',
                description: 'Rescuing, rehabilitating, and rehoming abandoned and abused animals while promoting responsible pet ownership.',
                website: 'https://animalrescue.org',
                logo: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop',
                category: 'Animal Welfare',
                registrationNumber: 'ARN-2024-004',
                totalRaised: 45000,
                totalDonors: 190
            },
            {
                name: 'Senior Care Support',
                description: 'Improving the quality of life for elderly individuals through companionship programs and essential services.',
                website: 'https://seniorcare.org',
                logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop',
                category: 'Senior Care',
                registrationNumber: 'SCS-2024-005',
                totalRaised: 38000,
                totalDonors: 150
            }
        ];

        for (const charityData of charities) {
            const charity = new Charity(charityData);
            await charity.save();
        }

        testUser.selectedCharity = (await Charity.findOne({ isFeatured: true }))._id;
        await testUser.save();

        console.log('Seed data created successfully!');
        console.log('Admin login: admin@golfcharity.com / admin123');
        console.log('User login: user@test.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();