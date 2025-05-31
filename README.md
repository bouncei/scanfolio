# ScanFolio 🚀

A web application for generating custom QR codes and short URLs that link to a dynamic business portfolio, complete with analytics tracking.

---

## ✨ Overview

ScanFolio empowers businesses and professionals to create a concise and engaging digital presence. Users can:

- Generate stylish, custom QR codes.
- Obtain shareable short URLs.
- Build a comprehensive business portfolio page (showcasing services, social links, contact info, etc.).
- Track engagement through an analytics dashboard (profile views, QR scans, link clicks).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Backend Logic:** Next.js API Routes
- **Database:** Supabase
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

---

## 🎯 Core Features & Progress

| Feature                                  | Status     | Est. Completion | Notes                                                               |
| :--------------------------------------- | :--------- | :-------------- | :------------------------------------------------------------------ |
| **1. User Management**                   |            |                 |                                                                     |
| 1.1 User Registration (Google Or Github) | ⏳ Pending |                 |                                                                     |
| 1.2 Social Login (Google & Github)       | ⏳ Pending |                 |                                                                     |
| 1.3 User Profile Management              | ⏳ Pending |                 |                                                                     |
| **2. QR Code Generation**                |            |                 |                                                                     |
| 2.1 Basic QR Code Generation             | ⏳ Pending |                 | Input URL -> Output QR                                              |
| 2.2 Color Customization (FG/BG)          | ⏳ Pending |                 |                                                                     |
| 2.3 Logo Integration                     | ⏳ Pending |                 |                                                                     |
| 2.4 QR Code Shape/Style Options          | ⏳ Pending |                 | Optional, advanced                                                  |
| 2.5 Download (PNG, SVG)                  | ⏳ Pending |                 |                                                                     |
| 2.6 Dynamic QR Codes (link to portfolio) | ⏳ Pending |                 | QR content is a link to the portfolio on this platform              |
| **3. Short URL Generation**              |            |                 |                                                                     |
| 3.1 Automatic Short URL for Portfolios   | ⏳ Pending |                 | e.g., `yourdomain.com/p/[unique_id]`                                |
| 3.2 Custom Alias for Short URLs          | ⏳ Pending |                 | e.g., `yourdomain.com/[custom_alias]` (Potentially premium feature) |
| 3.3 Link Management Dashboard            | ⏳ Pending |                 | List user's short URLs                                              |
| **4. Business Portfolio**                |            |                 |                                                                     |
| 4.1 Portfolio Creation UI                | ⏳ Pending |                 | Intuitive editor                                                    |
| 4.2 Add Business Information             | ⏳ Pending |                 | Name, tagline, description, contact                                 |
| 4.3 Logo & Brand Color Upload/Selection  | ⏳ Pending |                 |                                                                     |
| 4.4 Social Media Links Section           | ⏳ Pending |                 |                                                                     |
| 4.5 Image/Video Gallery                  | ⏳ Pending |                 |                                                                     |
| 4.6 Service Listing Section              | ⏳ Pending |                 |                                                                     |
| 4.7 Testimonials Section                 | ⏳ Pending |                 |                                                                     |
| 4.8 Call to Action (CTA) Buttons         | ⏳ Pending |                 |                                                                     |
| 4.9 Custom Links Section                 | ⏳ Pending |                 |                                                                     |
| 4.10 Portfolio Templates                 | ⏳ Pending |                 | Selectable pre-designs                                              |
| 4.11 Public Portfolio View               | ⏳ Pending |                 | Responsive design                                                   |
| **5. Analytics Dashboard**               |            |                 |                                                                     |
| 5.1 Track QR Code Scans (Total/Unique)   | ⏳ Pending |                 |                                                                     |
| 5.2 Track Portfolio Views                | ⏳ Pending |                 | From QR scans and direct short URL access                           |
| 5.3 Scans/Views Over Time (Graphs)       | ⏳ Pending |                 |                                                                     |
| 5.4 Geographic Location of Scans/Views   | ⏳ Pending |                 |                                                                     |
| 5.5 Device Type for Scans/Views          | ⏳ Pending |                 |                                                                     |
| 5.6 Click Tracking on Portfolio Links    | ⏳ Pending |                 | Social links, CTAs, custom links                                    |
| 5.7 Data Export Option                   | ⏳ Pending |                 | Optional, advanced                                                  |
| **6. General & Infrastructure**          |            |                 |                                                                     |
| 6.1 Database Schema Design               | ⏳ Pending |                 |                                                                     |
| 6.2 API Endpoint Development             | ⏳ Pending |                 | For all CRUD operations                                             |
| 6.3 Responsive Design Across Platform    | ⏳ Pending |                 |                                                                     |
| 6.4 Basic SEO for Portfolio Pages        | ⏳ Pending |                 |                                                                     |
| 6.5 Error Handling & Notifications       | ⏳ Pending |                 |                                                                     |

**Status Legend:**

- `⏳ Pending`
- `🚧 In Progress`
- `✅ Completed`
- `🧊 On Hold`
- `❌ Cancelled`

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version [e.g., 18.x or later])
- [npm](https://www.npmjs.com/)/[yarn](https://yarnpkg.com/)/[pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)
- [Your Database - e.g., Docker for local PostgreSQL instance]

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/bouncei/scanfolio
    cd scanfolio
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory by copying from `.env.example`.

    ```bash
    cp .env.example .env.local
    ```

    Update the `.env.local` file with your local configuration (database URLs, API keys, NextAuth secret, etc.).

    ```env
    # .env.local example
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


    ```

4.  **Run database migrations (if applicable):**

    ```bash
    # Example for Prisma
    # npx prisma migrate dev
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📖 Usage

- Navigate to the registration page to create an account.
- Log in to access your dashboard.
- From the dashboard, you can:
  - Create and customize your business portfolio.
  - Generate a QR code and short URL for your portfolio.
  - View analytics for your portfolio and QR codes.

---

## 🗺️ Roadmap (Post-MVP / Future Enhancements)

- [ ] Advanced QR Code Styling (e.g., gradients, custom eye shapes)
- [ ] Team Accounts / Multi-user Management
- [ ] Integration with [e.g., Google Analytics, CRMs]
- [ ] A/B Testing for Portfolio Elements
- [ ] Premium Subscription Tiers for Advanced Features
- [ ] API for Developers
- [ ] PWA Capabilities

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please make sure to update tests as appropriate.

---

## 📜 License

This project is licensed under the [Your Chosen License - e.g., MIT License] - see the [LICENSE.md](LICENSE.md) file for details.

---

## 📧 Contact

Joshua Inyang (Bouncey) - bouncei.tech

Project Link: [https://github.com/bouncei/scanfolio](https://github.com/bouncei/scanfolio)
