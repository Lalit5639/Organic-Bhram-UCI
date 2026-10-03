const form=document.getElementById("verify-form");
const result=document.getElementById("verify-result");
form.addEventListener("submit",e=>{
  e.preventDefault();
  const code=document.getElementById("code").value.trim();
  if(!code)return;
  result.hidden=false;
  result.innerHTML=`<strong>Demo check complete</strong><br><br>
  Product: <b>Bhram™</b><br>
  Enter kiya gaya batch: <b>${code.replace(/</g,"&lt;")}</b><br>
  Status: <b>Yeh demo result hai</b><br><br>
  Asli batch aur lab report check karne ke liye live database abhi connect nahi hai.`;
});
