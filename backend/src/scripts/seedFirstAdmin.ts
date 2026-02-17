/**
 * @fileoverview Script para crear el primer administrador.
 * Se ejecuta manualmente o en el primer deploy.
 * @module scripts/seedFirstAdmin
 * 
 * @usage
 * npm run seed:admin
 * 
 * @requires .env con FIRST_ADMIN_EMAIL y FIRST_ADMIN_PASSWORD
 */
import 'dotenv/config';

import bcryptjs from "bcryptjs";
import { User } from "../models/authModel.js";
import { connectMongoDB } from "../config/mongoDB.js";

//Más rounds = más seguro pero más lento. 10 es el estándar recomendado.
const SALT_ROUNDS = 10;

/**
 * Crea el primer admin si no existe ninguno.
 * @async
 * @function seedFirstAdmin
 * @returns {Promise<void>}
 */
const seedFirstAdmin = async (): Promise<void> => {
  try {
    // Conectar a BD
    const dbConnection = await connectMongoDB();
    console.log(`📦 ${dbConnection.message}`);

    // Verificar si ya existe algún admin
    const existingAdmin = await User.findOne({ role: "admin" });
    
    if (existingAdmin) {
      console.log("ℹ️  Admin already exists:", existingAdmin.email);
      console.log("ℹ️  Skipping first admin creation");
      process.exit(0);
    }

    // Validar variables de entorno requeridas
    const adminEmail = process.env.FIRST_ADMIN_EMAIL;
    const adminPassword = process.env.FIRST_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ Missing required environment variables:");
      console.error("   - FIRST_ADMIN_EMAIL");
      console.error("   - FIRST_ADMIN_PASSWORD");
      console.error("");
      console.error("Please set them in your .env file:");
      console.error("FIRST_ADMIN_EMAIL=admin@tuempresa.com");
      console.error("FIRST_ADMIN_PASSWORD=SecurePass123!");
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(adminPassword, SALT_ROUNDS);

    // Crear admin
    const admin = await User.create({
      name: process.env.FIRST_ADMIN_NAME || "System Administrator",
      email: adminEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });

    console.log("");
    console.log("✅ First admin created successfully");
    console.log("   Email:", admin.email);
    console.log("   Name:", admin.name);
    console.log("   Role:", admin.role);
    console.log("");
    console.log("🔐 IMPORTANT: Change password after first login");
    console.log("   Login at: POST /auth/login");

    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating first admin:", error);
    process.exit(1);
  }
};

// Ejecutar
seedFirstAdmin();