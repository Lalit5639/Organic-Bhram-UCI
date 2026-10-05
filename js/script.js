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

const timeline=document.querySelector("#honey-timeline");
const timelineToggle=document.querySelector(".timeline-toggle");
const timelineSlider=timeline?.closest(".timeline-slider");
if(timeline&&timelineToggle&&timelineSlider){
  const timelineItems=[...timeline.querySelectorAll(".timeline-item")];
  const timelinePosition=timelineSlider.querySelector(".timeline-position");
  const timelinePrevious=timelineSlider.querySelector(".timeline-prev");
  const timelineNext=timelineSlider.querySelector(".timeline-next");
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let timelineVisible=false;
  let userPaused=false;
  let currentTimelineStep=0;
  let timelineTimer=null;
  let exitTimer=null;

  function updateTimelineAnimation(){
    const canAnimate=timelineVisible&&!userPaused&&!reducedMotion.matches;
    if(!canAnimate){
      clearInterval(timelineTimer);
      timelineTimer=null;
      return;
    }
    if(timelineTimer)return;
    timelineTimer=setInterval(()=>showTimelineStep(currentTimelineStep+1,1),3000);
  }

  function showTimelineStep(index,direction){
    const nextIndex=(index+timelineItems.length)%timelineItems.length;
    const currentItem=timelineItems[currentTimelineStep];
    const nextItem=timelineItems[nextIndex];
    clearTimeout(exitTimer);
    currentItem.classList.remove("is-active","is-exiting");
    currentItem.classList.add("is-exiting");
    nextItem.classList.remove("is-exiting");
    if(direction<0)nextItem.classList.add("from-left");
    else nextItem.classList.remove("from-left");
    nextItem.classList.add("is-active");
    currentItem.setAttribute("aria-hidden","true");
    nextItem.removeAttribute("aria-hidden");
    currentTimelineStep=nextIndex;
    timelinePosition.textContent=`${String(nextIndex+1).padStart(2,"0")} / ${String(timelineItems.length).padStart(2,"0")}`;
    exitTimer=setTimeout(()=>currentItem.classList.remove("is-exiting"),550);
  }

  function setTimelinePaused(paused){
    userPaused=paused;
    timelineToggle.textContent=paused?"Resume timeline":"Pause timeline";
    timelineToggle.setAttribute("aria-label",paused?"Resume timeline motion":"Pause timeline motion");
    timelineToggle.setAttribute("aria-pressed",String(paused));
    updateTimelineAnimation();
  }

  timeline.classList.add("is-sequencing");
  const timelineObserver=new IntersectionObserver(entries=>{
    timelineVisible=entries[0].isIntersecting;
    updateTimelineAnimation();
  },{threshold:.1});
  timelineObserver.observe(timeline);
  timelineToggle.addEventListener("click",()=>setTimelinePaused(!userPaused));
  timelinePrevious.addEventListener("click",()=>showTimelineStep(currentTimelineStep-1,-1));
  timelineNext.addEventListener("click",()=>showTimelineStep(currentTimelineStep+1,1));
  timeline.addEventListener("keydown",event=>{
    if(event.key==="ArrowLeft"){showTimelineStep(currentTimelineStep-1,-1)}
    if(event.key==="ArrowRight"){showTimelineStep(currentTimelineStep+1,1)}
  });
  reducedMotion.addEventListener("change",updateTimelineAnimation);
  timelineToggle.setAttribute("aria-label","Pause timeline motion");
  updateTimelineAnimation();
}

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
