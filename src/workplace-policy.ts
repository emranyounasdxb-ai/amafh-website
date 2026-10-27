import { contact, type Locale } from './content.ts';
import { labelFor, pathFor } from './routes.ts';

export function workplacePolicy(locale: Locale) {
  const ar = locale === 'ar';
  return `<nav class="breadcrumbs container" aria-label="${ar ? 'مسار الصفحة' : 'Breadcrumb'}"><a href="${pathFor(locale)}">${labelFor('', locale)}</a><span aria-hidden="true">/</span><span aria-current="page">${labelFor('workplace-policy', locale)}</span></nav>
    <section class="inner-hero inner-hero-centered container"><div class="inner-hero-copy">
      <p class="eyebrow">${ar ? 'أماف للوساطة التجارية' : 'AMAFH Commercial Brokers'}</p>
      <h1>${ar ? 'سياسة العمل من المكتب' : 'On-site Workplace Policy'}</h1>
      <p class="inner-lead">${ar ? 'توضح هذه السياسة ترتيبات العمل من المكتب لدى أماف للوساطة التجارية في دبي، وكيفية التواصل معنا للاستفسار عن تفاصيل الوظيفة.' : 'This policy explains the office-based work arrangement at AMAFH Commercial Brokers in Dubai and how to contact us about role-specific details.'}</p>
    </div></section>
    <div class="container workplace-policy-content">
      <section class="reading-chapter" aria-labelledby="work-arrangement"><h2 id="work-arrangement">${ar ? 'العمل من المكتب حصراً' : 'Office-based work only'}</h2>
        <p>${ar ? 'يؤدي موظفو أماف للوساطة التجارية أعمالهم من مكتب الشركة. العمل حضوري حصراً؛ ولا توفر الشركة ترتيبات للعمل الهجين أو العمل عن بُعد.' : 'Employees of AMAFH Commercial Brokers work from the company office. Our work arrangement is on-site only; we do not offer hybrid or remote working arrangements.'}</p></section>
      <section class="reading-chapter" aria-labelledby="office-location"><h2 id="office-location">${ar ? 'موقع المكتب' : 'Office location'}</h2>
        <address>${ar ? 'المكتبان 206 و218، المبنى B، قرية الأعمال، بالقرب من برج الساعة، بور سعيد، ديرة، دبي، الإمارات العربية المتحدة.' : 'Offices 206 and 218, Block B, Business Village, near Clock Tower, Port Saeed, Deira, Dubai, UAE.'}</address></section>
      <section class="reading-chapter" aria-labelledby="role-questions"><h2 id="role-questions">${ar ? 'الاستفسار عن الوظيفة وشروط العمل' : 'Questions about your role and employment terms'}</h2>
        <p>${ar ? 'للاستفسار عن وظيفة معينة أو ترتيبات الإشراف الإداري أو شروط التوظيف التي تنطبق عليك، يُرجى التواصل مع الشركة عبر البريد الإلكتروني أو الهاتف أدناه، مع ذكر الوظيفة المعنية والأسئلة التي ترغب في توضيحها.' : 'For clarification about an individual role, reporting arrangements or the employment terms that apply to you, contact the company using the email address or phone number below. Include the role you are asking about and the points you would like clarified.'}</p>
        <p><a href="mailto:${contact.email}"><bdi>${contact.email}</bdi></a><br/><a href="tel:${contact.phoneHref}"><bdi>${contact.phone}</bdi></a></p></section>
    </div>`;
}
