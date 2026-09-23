Web Developer Technical Assessment
 
 Objective
 
Build a small production-style marketing website that demonstrates your ability to develop, integrate, track, troubleshoot, and optimize a web experience.
 
The assessment is designed to reflect the type of work you would handle when working directly with a Marketing team.
 
 
 
 1. Marketing Landing Page
 
Build a responsive landing page for a fictional company offering a digital marketing service.
 
The page should include:
 
* Hero section with CTA
* Services/features
* Testimonials or social proof
* Pricing or benefits section
* Lead-generation form
* Footer
 
The design is up to you. We are evaluating the implementation, UX, and technical decisions rather than graphic design.
 
 Requirements
 
* Responsive desktop/tablet/mobile layout
* Semantic HTML
* Reusable components
* Clean and maintainable code
* Proper loading, error, and success states
* Basic accessibility considerations
 
---
 
 2. Lead Generation Flow
 
Create a working lead submission flow.
 
The form should collect:
 
* Name
* Email
* Company
* Phone
* Message
 
Implement:
 
Frontend → Validation → API → Response → Success/Error State
 
The API may be:
 
* Your own backend endpoint
* Serverless function
* Mock API
 
The implementation should include appropriate validation and error handling.
 
Prevent accidental duplicate submissions.
 
---
 
 3. CRM Integration
 
Simulate sending the submitted lead to a CRM such as HubSpot.
 
You do not need real HubSpot credentials.
 
Demonstrate how your application would:
 
* Send the lead information
* Handle API success/failure
* Protect API credentials
* Handle failed CRM requests
 
Explain your approach in the README.
 
---
 
 4. Marketing Tracking
 
Implement tracking for:
 
* Page view
* CTA click
* Form started
* Form submitted
* Form submission failure
 
Use Google Tag Manager or Google Analytics where practical.
 
Also implement or demonstrate a Meta Pixel conversion event for a successful lead submission.
 
The tracking should only fire at the appropriate point in the user journey.
 
 Important
 
The conversion event must **not fire simply because the submit button was clicked**.
 
It should fire after a successful submission.
 
---
 
5. Debugging Challenge
 
The following issue has been reported:
 
> "Marketing says we're receiving leads, but Meta is showing fewer conversions than the number of successful form submissions."
 
Explain and demonstrate how you would investigate this problem.
 
Your README should cover:
 
* What you would check first
* Browser/network tools you would use
* GTM configuration
* Meta Events Manager
* Possible duplicate or missing events
* Possible frontend/backend issues
* How you would verify the final fix
 
---
 
 6. Performance & SEO
 
Optimize the website for production.
 
Include:
 
* Appropriate metadata
* Semantic structure
* Optimized images
* Lazy loading where appropriate
* Efficient JavaScript
* Reasonable Core Web Vitals
* No unnecessary third-party scripts
 
Run a performance test using Lighthouse or a similar tool and include the results in your submission.
 
---
 
 7. Technical Scenario
 
Marketing now requests:
 
 "We need to create 10 more campaign landing pages next month, all with the same structure but different content."
 
Explain how you would modify your implementation to make this efficient.
 
Your answer should discuss things such as:
 
* Reusable components
* Templates
* Configuration/data-driven pages
* CMS considerations
* Design consistency
* Tracking consistency
 
You do not need to actually build all 10 pages.
 
---
 
 Deliverables
 
Please submit:
 
 1. Source Code
 
GitHub/GitLab repository or ZIP.
 
 2. Deployed Website
 
Provide a working URL.
 
 3. README
 
Include:
 
* Technology choices
* Project structure
* Architecture decisions
* Form/API flow
* CRM integration approach
* Tracking implementation
* Debugging approach
* Performance results
* Assumptions and limitations
* What you would improve with additional time
 
 4. Short Technical Walkthrough
 
Record a **5–10 minute video** explaining:
 
* Your implementation
* Important technical decisions
* Tracking setup
* How the lead flow works
* How you approached the debugging scenario
 
---
 
Deadline: August 26 2026 (Wednesday)
 
 
 
We are more interested in technical quality, decision-making, problem-solving, and production readiness than the number of features completed.
 