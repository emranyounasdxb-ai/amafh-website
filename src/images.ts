import type { Locale } from './content.ts';
import type { Bi } from './service-details.ts';
const alt:Record<string,Bi>={
 hero:['Illustrative campaign portrait of a woman holding an unbranded payment card','صورة حملة توضيحية لسيدة تحمل بطاقة دفع بدون علامة تجارية'],
 dubai:['AI-created architectural view inspired by the Dubai skyline','مشهد معماري منشأ بالذكاء الاصطناعي مستوحى من أفق دبي'],
 meeting:['Illustrative conversation about financial plans in a modern lounge','حوار توضيحي حول الخطط المالية في مساحة حديثة'],
 approach:['Illustrative personal consultation in a bright meeting space','جلسة توضيحية لحوار شخصي في مساحة مضيئة'],
 'credit-cards':['Illustrative plum and pink unbranded payment cards on stone plinths','بطاقات دفع توضيحية بنفسجية ووردية بدون علامة تجارية على قواعد حجرية'],
 'personal-finance':['Illustrative couple considering their household plans','زوجان في مشهد توضيحي لمناقشة خطط الأسرة'],
 'car-loans':['Illustrative graphite sedan in a Dubai-inspired courtyard','سيارة رمادية توضيحية في ساحة مستوحاة من دبي'],
 mortgages:['Illustrative home interior with keys and soft lilac accents','مساحة منزلية توضيحية مع مفاتيح ولمسات ليلكية'],
 'car-insurance':['Illustrative vehicle under an architectural canopy','مركبة توضيحية تحت مظلة معمارية'],
 'life-insurance':['Illustrative family spending time together at home','أسرة في مشهد توضيحي تقضي وقتاً معاً في المنزل'],
 'current-accounts':['Illustrative smartphone and unbranded card for everyday banking','هاتف وبطاقة بدون علامة تجارية لتوضيح الخدمات المصرفية اليومية'],
 'savings-accounts':['Illustrative coin stacks on stone steps representing a savings goal','عملات توضيحية على درجات حجرية ترمز إلى هدف ادخاري'],
};
export const imageURL=(id:string)=>`/images/generated/${id}.webp`;
export function campaignImage(id:string,locale:Locale,options:{hero?:boolean;decorative?:boolean;className?:string;sizes?:string}={}) {
 const portrait=id==='dubai'||id==='approach';const width=portrait?1122:1440,height=portrait?1402:1080;
 const text=options.decorative?'':alt[id]?.[locale==='en'?0:1]??alt.meeting[locale==='en'?0:1];
 return `<img class="${options.className??''}" src="${imageURL(id)}" srcset="/images/generated/${id}-640.webp 640w, /images/generated/${id}-960.webp 960w, ${imageURL(id)} ${width}w" sizes="${options.sizes??'(max-width: 699px) 90vw, (max-width: 1100px) 50vw, 45vw'}" alt="${text}" width="${width}" height="${height}" loading="${options.hero?'eager':'lazy'}" decoding="async" ${options.hero?'fetchpriority="high"':''}/>`;
}
