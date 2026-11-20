export type Profile={name:string,title:string,university:string,tagline:string,bio:string,email:string,years:string};
export type Entry={id:string,title:string,description:string,year?:string,url?:string};
export type Testimonial={id:string,name:string,message:string,approved:boolean};
export type Content={profile:Profile,journey:Entry[],research:Entry[],achievements:Entry[],testimonials:Testimonial[]};
async function request<T>(path:string,options?:RequestInit):Promise<T>{const r=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...options?.headers}});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');return data as T;}
export const api={get:()=>request<Content>('/content'),submit:(name:string,message:string)=>request<{message:string}>('/testimonials',{method:'POST',body:JSON.stringify({name,message})}),login:(password:string)=>request<{token:string}>('/admin/login',{method:'POST',body:JSON.stringify({password})}),update:(token:string,data:Content)=>request<Content>('/admin/content',{method:'PUT',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify(data)})};
