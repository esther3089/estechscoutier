import { EmailTemplate } from '../types';

export const BUILTIN_TEMPLATES: EmailTemplate[] = [
  {
    id: 'builtin-followup',
    name: 'Follow-up Email',
    category: 'Sales',
    description: "A gentle follow-up email for prospects who haven't responded",
    subject: 'Quick follow-up regarding our discussion, {name}',
    body: `Hi {name},

I hope your week is off to a productive start!

I wanted to quickly bump this to the top of your inbox in case our earlier note got buried. We have been helping teams streamline their outreach workflows and achieve significantly higher response rates.

Do you have 5 minutes this Thursday or Friday for a quick chat to explore if this could benefit your team?

Best regards,
Outreach Specialist`,
    isCustom: false,
  },
  {
    id: 'builtin-special-offer',
    name: 'Special Offer',
    category: 'Marketing',
    description: 'A promotional email template for special offers and limited-time deals',
    subject: 'Exclusive seasonal access for {name} – 40% Off this week',
    body: `Hello {name},

Because of your great work in your space, we'd love to extend an exclusive 40% seasonal savings package for you this month.

Here is what you get access to immediately:
- Full unlocked productivity toolkit
- 1-on-1 personalized setup consultation
- Priority response and automated deliverability audits

Click the link below or reply to this note to claim your spot before Friday:
https://estechscoutier.app/deals

Best regards,
The EstechScoutier Growth Team`,
    isCustom: false,
  },
  {
    id: 'builtin-partnership',
    name: 'Partnership Inquiry',
    category: 'Business',
    description: 'A strategic partnership pitch for business collaborations',
    subject: 'Exploring collaborative synergies with {name}',
    body: `Hi {name},

I've been following your updates and love the approach your brand takes towards customer value and smart tools.

We are currently rolling out a joint partner initiative and identified your team as a natural fit for cross-collaboration. We can bring immediate mutual value to our respective audiences.

Would you be open to exchanging a few ideas next Tuesday?

Warm regards,
Head of Strategic Partnerships`,
    isCustom: false,
  },
  {
    id: 'builtin-networking',
    name: 'Warm Introduction',
    category: 'Relationship',
    description: 'Establish a genuine professional relationship and mutual connection',
    subject: 'Pleasure connecting with you, {name}',
    body: `Hey {name},

I came across your profile while reviewing industry innovators and was genuinely impressed by your recent milestones.

I always enjoy connecting with leaders doing inspiring work in our domain. No pitch here—just wanted to introduce myself and say hello.

Wishing you continued momentum!

Cheers,
Professional Network Member`,
    isCustom: false,
  },
];

