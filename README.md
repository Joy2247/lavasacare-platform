# 🏥 LavasaCare — Local Healthcare Services Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> A modern, unified digital healthcare platform designed to connect residents, visitors, and healthcare providers in **Lavasa, Maharashtra**.

---

## 📖 Overview

Lavasa's distinct geography presents unique challenges for accessing timely medical assistance, emergency transport, and live provider availability. **LavasaCare** bridges this gap by offering a single, streamlined point of access for patients to discover certified doctors, check hospital bed status, order critical medications, and request emergency services.

---

## 🎯 Problem Statement

### **Context & Background**
Lavasa is a planned hill city situated in the Western Ghats (around 65 km from Pune, Maharashtra). While it attracts permanent residents, retirees, university students, and a continuous influx of weekend tourists, its remote, valley-centric terrain and distance from major metropolitan medical hubs introduce severe healthcare logistics challenges.

### **Core Pain Points**
1. **Geographic Isolation & Critical Transit Delays**:
   - Reaching tertiary multi-specialty hospitals in Pune takes 1.5 to 2+ hours over winding ghat roads.
   - In emergency situations, every minute matters; yet emergency contact information, ambulance availability, and dispatch points are fragmented across various informal channels.

2. **Healthcare Information Asymmetry**:
   - Healthcare facilities, private practitioners, visiting doctors, and diagnostic labs in Lavasa operate in silos.
   - Residents and tourists lack a verified, single source of truth to check which specialists are currently available or when clinics are open.

3. **Zero Visibility on Bed & Resource Availability**:
   - Patients in critical conditions often arrive at local clinics or community healthcare centers without knowing if emergency, ICU, or general beds and necessary life-support equipment are vacant.

4. **Last-Mile Medicine & Prescription Access**:
   - Specialized and emergency medications are frequently out of stock or difficult to procure across sprawling residential clusters, lakeside promenades, and secluded villas without an organized delivery network.

5. **Inefficient Manual Workflows**:
   - Medical appointments and inquiries are largely handled via unmonitored phone calls, paper slips, or ad-hoc messaging, leading to missed appointments, unfulfilled orders, and unmanaged patient queues.

### **The LavasaCare Solution**
LavasaCare acts as a dedicated **local healthcare orchestration platform** that:
- **Centralizes Provider Discovery**: Connects patients with verified doctors, specialty clinics, and diagnostic labs.
- **Enables Real-Time Resource Transparency**: Provides live, timestamped tracking of available beds and verified doctor OPD hours.
- **Streamlines Emergency & Essential Services**: Offers instant emergency contact access, ambulance dispatch requests, and door-to-door pharmacy delivery.
- **Empowers Healthcare Administrators**: Gives local clinics and hospitals a dedicated management dashboard to review appointment requests, manage bed counts, and maintain accurate operational data.

---

## ✨ Key Features

- **🚑 Emergency & Ambulance Support**: Instant one-click access to emergency hotlines and ambulance dispatch assistance.
- **🩺 Doctor Directory & Appointments**: Browse specialist doctors, check schedule availability, and request consultation slots.
- **🛏️ Live Hospital Bed Tracker**: Real-time status reporting for ICU, General Ward, and Emergency beds across partner facilities.
- **💊 Doorstep Medicine Delivery**: Upload prescription requests and order medicines directly through participating local pharmacies.
- **📦 Preventive Health Packages**: Discover wellness and diagnostic health checkup packages with instant enquiry booking.
- **🌐 3D Interactive Hero Experience**: Immersive 3D medical emblem and graphics rendered with **Three.js** and **React Three Fiber**.
- **🛠️ Hospital & Provider Admin Dashboard**: Back-office portal allowing administrators to review incoming requests, track patient inquiries, and update facility resources.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript) |
| **Styling & Components** | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI Primitives), Lucide Icons |
| **3D & Visuals** | [Three.js](https://threejs.org/), `@react-three/fiber`, `@react-three/drei`, Framer Motion |
| **State & Data Management** | [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/), SQLite |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) / Node.js |

---

## 📁 Project Structure

```plaintext
lavasacare-platform/
├── db/                     # SQLite database files
├── prisma/                 # Prisma schema definition & migrations
│   └── schema.prisma
├── public/                 # Static assets, images, and 3D models (.glb)
│   ├── images/
│   └── models/
├── scripts/                # 3D asset processing and utility scripts
├── src/
│   ├── app/                # Next.js App Router (pages and API routes)
│   │   ├── api/            # REST API endpoints (appointments, medicine, enquiries)
│   │   ├── globals.css     # Global styles & Tailwind configuration
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main application entry point
│   ├── components/
│   │   ├── lavasacare/     # LavasaCare domain-specific components & views
│   │   └── ui/             # Reusable shadcn/ui component library
│   ├── hooks/              # Custom React hooks
│   └── lib/                # API client, database connection, utilities
├── .env.example            # Environment variables template
├── bun.lock                # Bun dependency lockfile
└── package.json            # Project manifest
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have one of the following installed:
- [Bun](https://bun.sh/) *(Recommended)* or [Node.js (v20+)](https://nodejs.org/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Joy2247/lavasacare-platform.git
cd lavasacare-platform
```

### 2. Install Dependencies

Using Bun:
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration:
```bash
cp .env.example .env
```

Ensure `DATABASE_URL` is configured:
```env
DATABASE_URL="file:./db/custom.db"
```

### 4. Setup Database

Generate the Prisma client and push the database schema:
```bash
bun run db:push
bun run db:generate
```

### 5. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the platform.

---

## 🔌 API Endpoints

The platform includes built-in Next.js REST API routes:

| Method | Endpoint | Description |
|---|---|---|
| `GET` / `POST` | `/api/appointments` | Fetch and submit doctor appointment requests |
| `GET` / `PUT` | `/api/appointments/[id]` | Inspect or update specific appointment records |
| `GET` / `POST` | `/api/medicine` | Query and submit pharmacy medicine orders |
| `GET` / `PUT` | `/api/medicine/[id]` | Inspect or update medicine delivery status |
| `GET` / `POST` | `/api/enquiries` | Fetch or submit health checkup package inquiries |
| `GET` / `POST` | `/api/contact` | Submit emergency and general contact messages |

---

## 🗺️ Roadmap

- [ ] Automated SMS & WhatsApp notifications for confirmed bookings.
- [ ] Telemedicine video consultation via WebRTC.
- [ ] Live GPS integration for ambulance dispatch tracking.
- [ ] Digital payment gateway integration (Razorpay / UPI).

---

## 👤 Author

- **Shreyansh Patel** — [@Joy2247](https://github.com/Joy2247)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
