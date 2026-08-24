const langBtn=document.getElementById('langBtn');
let lang='mn';
function setLang(next){
  lang=next;
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-mn]').forEach(el=>{el.innerHTML=el.dataset[lang]});
  langBtn.textContent=lang==='mn'?'EN':'MN';
}
langBtn.addEventListener('click',()=>setLang(lang==='mn'?'en':'mn'));

const form=document.getElementById('orderForm');
const toast=document.getElementById('toast');
form.addEventListener('submit',e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(form).entries());
  localStorage.setItem('nogoonSuvargaDraft',JSON.stringify({...data,createdAt:new Date().toISOString()}));
  toast.textContent=lang==='mn'
    ? 'Захиалгын мэдээлэл хадгалагдлаа. Дараагийн алхам: төлбөрийн холболт.'
    : 'Order details saved. Next step: connect the payment gateway.';
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),4200);
});
