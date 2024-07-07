const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const FAQ = require('../models/faq_model');
const UserModel = require('../models/user_model');
const staticContent = require('../models/staticContent_model');

const staticFAQs = [
  {
    question: "What is the application deadline?",
    answer: "The application deadline is December 31st.",
    role: "STUDENT"
  },
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking on the 'Forgot Password' link.",
    role: "STUDENT"
  },
  {
    question: "How do I submit grades?",
    answer: "You can submit grades through the faculty portal.",
    role: "FACULTY"
  },
  {
    question: "How do I access student records?",
    answer: "You can access student records through the admin dashboard.",
    role: "ADMIN"
  }
];
var TC = {
  type: "T&C",
  title: "Term And Conditions ",
  description: "A term and conditions agreement is the agreement that includes the terms, the rules and the guidelines of acceptable behavior and other useful sections to which users must agree in order to use or access your website and mobioe app."
};
var AboutUs = {
  type: "AboutUs",
  title: "About Us",
  description: "An about us oage helps your company make a good first impression, and is critical for building customer trust and loyalty."
};
var ContactUs = {
  type: "ContactUs",
  title: "contactUs",
  description: "They slap an email address, phone, and location on a plain background and call it a day"
};
// Function to insert static FAQs
async function insertStaticContent() {
  try {
    const arr = [TC, AboutUs, ContactUs];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      const isInserted = await staticContent.findOne({ type: element.type })
      if (isInserted) {
        console.log(`${element.type} already inserted in database`)
        continue
      }
      const success = await staticContent.create(element);
      if (success) {
        console.log(`${element.type} inserted successfully.`)
      }

    }
  } catch (error) {
    console.log("Internal Server Error")
  }
}
async function insertStaticFAQs() {
  for (const faq of staticFAQs) {
    const existingFAQ = await FAQ.findOne({ question: faq.question, role: faq.role });
    if (!existingFAQ) {
      await FAQ.create(faq);
      console.log(`Inserted FAQ for role ${faq.role}: ${faq.question}`);
    } else {
      console.log(`FAQ already exists for role ${faq.role}: ${faq.question}`);
    }
  }
}

// Function to create default admin
async function createDefaultAdmin() {
  try {
    const adminUser = await UserModel.findOne({ userType: "ADMIN" });

    if (adminUser) {
      console.log('Default admin already created');
    } else {
      const adminDefault = {
        firstName: "vikas",
        lastName: "agrahari",
        email: "hackmobile63@gmail.com",
        pass: bcrypt.hashSync("vikas", 10),
        mobile: 7237890694,
        countryCode: "+91",
        userType: "ADMIN",
        otpVarify: true,
        statusCode: "ACTIVE",
      };

      const Admin = new UserModel(adminDefault);
      await Admin.save();
      console.log("Default admin created", Admin);
    }
  } catch (error) {
    console.error('Error creating default admin', error);
  }
}

const DB_URI = process.env.DB_URI; //|| "mongodb://localhost:27017/M2_Test"

mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await insertStaticFAQs();
    await createDefaultAdmin();
    await insertStaticContent();
    // mongoose.connection.close();
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });
