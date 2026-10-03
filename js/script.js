const header=document.getElementById("header");
window.addEventListener("scroll",()=>{if(!header)return;header.classList.toggle("scrolled",window.scrollY>50)});
const backToTop=document.querySelector(".back-to-top");
function updateBackToTop(){backToTop?.classList.toggle("is-visible",window.scrollY>500)}
window.addEventListener("scroll",updateBackToTop,{passive:true});
updateBackToTop();
backToTop?.addEventListener("click",()=>window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
const toggle=document.querySelector(".menu-toggle"), siteHeader=document.querySelector(".site-header");
function setMenuOpen(open){
  if(!toggle||!siteHeader)return;
  siteHeader.classList.toggle("open",open);
  toggle.setAttribute("aria-expanded",String(open));
  toggle.setAttribute("aria-label",open?"Close menu":"Open menu");
}
toggle?.addEventListener("click",()=>setMenuOpen(!siteHeader.classList.contains("open")));
document.querySelectorAll(".nav a").forEach(link=>link.addEventListener("click",()=>setMenuOpen(false)));
document.addEventListener("keydown",event=>{if(event.key==="Escape")setMenuOpen(false)});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const heroSlides=[...document.querySelectorAll(".hero-slide")];
const heroDots=[...document.querySelectorAll(".hero-dot")];
const prevBtn=document.querySelector(".carousel-prev");
const nextBtn=document.querySelector(".carousel-next");
let currentSlide=0;
let heroTimer=null;

function showSlide(index){
  if(!heroSlides.length) return;
  currentSlide=(index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide,i)=>slide.classList.toggle("active",i===currentSlide));
  heroDots.forEach((dot,i)=>dot.classList.toggle("active",i===currentSlide));
}

function startHeroCarousel(){
  if(heroTimer || !heroSlides.length) return;
  heroTimer=setInterval(()=>showSlide(currentSlide+1),4500);
}

function stopHeroCarousel(){
  if(!heroTimer) return;
  clearInterval(heroTimer);
  heroTimer=null;
}

prevBtn?.addEventListener("click",()=>{showSlide(currentSlide-1); stopHeroCarousel(); startHeroCarousel();});
nextBtn?.addEventListener("click",()=>{showSlide(currentSlide+1); stopHeroCarousel(); startHeroCarousel();});
heroDots.forEach(dot=>dot.addEventListener("click",()=>{showSlide(Number(dot.dataset.slide)); stopHeroCarousel(); startHeroCarousel();}));
const heroSection=document.querySelector(".hero");
heroSection?.addEventListener("mouseenter",stopHeroCarousel);
heroSection?.addEventListener("mouseleave",startHeroCarousel);
if(heroSlides.length){showSlide(0); startHeroCarousel();}

// Bhram™ 2D manufacturing animation controller
const scenes = [...document.querySelectorAll(".process-scene")];
const dots = [...document.querySelectorAll(".process-dots .dot")];
let currentScene = 0;
function showScene(n){
  if(!scenes.length) return;
  currentScene = (n + scenes.length) % scenes.length;
  scenes.forEach((s,i)=>s.classList.toggle("active",i===currentScene));
  dots.forEach((d,i)=>d.classList.toggle("active",i===currentScene));
}
dots.forEach(d=>d.addEventListener("click",()=>showScene(Number(d.dataset.go)-1)));
document.querySelector(".process-prev")?.addEventListener("click",()=>showScene(currentScene-1));
document.querySelector(".process-next")?.addEventListener("click",()=>showScene(currentScene+1));

// Auto-progress while the 2D section is visible; pauses when the user is interacting.
let processTimer;
function startProcessTimer(){
  if(processTimer || !scenes.length) return;
  processTimer=setInterval(()=>showScene(currentScene+1),6500);
}
function stopProcessTimer(){clearInterval(processTimer);processTimer=null}
const processBox=document.querySelector(".process-2d");
if(processBox){
  const processObserver=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting) startProcessTimer(); else stopProcessTimer();
  },{threshold:.35});
  processObserver.observe(processBox);
  processBox.addEventListener("mouseenter",stopProcessTimer);
  processBox.addEventListener("mouseleave",startProcessTimer);
}

function submitContact(e){e.preventDefault();const s=document.getElementById("form-status");s.textContent="Demo form submitted. Connect this form to your email/CRM backend for production.";e.target.reset();return false}
