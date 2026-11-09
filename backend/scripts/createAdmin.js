require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Society = require('../models/Society');

const createAdmin = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected');

        const societyCode = process.env.SOCIETY_CODE;
        const adminEmail = process.env.ADMIN_EMAIL;

        let society = await Society.findOne({
            societyCode
        });

        if (!society) {

            society = await Society.create({

                societyName: process.env.SOCIETY_NAME,

                societyCode,

                address: process.env.SOCIETY_ADDRESS,

                city: process.env.SOCIETY_CITY,

                state: process.env.SOCIETY_STATE,

                contactEmail: adminEmail,

                isActive: true

            });

            console.log('Society Created');

        }

        const existingAdmin = await User.findOne({
            email: adminEmail.toLowerCase()
        });

        if (existingAdmin) {

            console.log('Admin already exists');

            return;

        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        await User.create({

            fullName: process.env.ADMIN_NAME,

            email: adminEmail.toLowerCase(),

            phone: process.env.ADMIN_PHONE,

            password: hashedPassword,

            flatNumber: 'ADMIN',

            societyId: society._id,

            role: 'admin',

            approvalStatus: 'approved'

        });

        console.log('Admin Account Created Successfully');

    } catch (error) {

        console.error(error);

    } finally {

        await mongoose.disconnect();

    }

};

createAdmin();