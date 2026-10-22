var $ = function(id){ return document.getElementById(id); };
var ROOMS = [
 {id:'cozy', name:'Cozy Couple Room', img:'assets/room1.jpg', p:{'3':499,'6':699,n:999}, feat:'Double bed, AC, smart TV, attach bathroom'},
 {id:'deluxe', name:'Deluxe Couple Room', img:'assets/room2.jpg', p:{'3':699,'6':999,n:1499}, feat:'King bed, mini fridge, room service, city view'},
 {id:'suite', name:'Premium Suite', img:'assets/room3.jpg', p:{'3':999,'6':1499,n:2499}, feat:'Jacuzzi, private lounge, free breakfast, late checkout'},
 {id:'twin', name:'Twin Deluxe', img:'assets/room4.jpg', p:{'3':599,'6':899,n:1299}, feat:'Do alag beds, dost ya family ke liye'}
];
var FAC = [
 ['AC aur garam paani','Har room me, 24x7'],
 ['High-speed Wi-Fi','Free, no limit'],
 ['Smart TV','Har room me'],
 ['Room service','Deluxe aur Suite me'],
 ['Parking','Gate ke andar, CCTV me'],
 ['Discreet entry','Alag gate, koi sawal nahi']
];
function lsGet(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }
function lsSet(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function users(){ return lsGet('ao_users') || []; }
function session(){ return lsGet('ao_session'); }
function currentUser(){ var s = session(); if(!s) return null; var u = users(); for(var i=0;i<u.length;i++){ if(u[i].email===s.email) return u[i]; } return null; }
function show(id){ document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); }); $(id).classList.add('active'); window.scrollTo(0,0); }
function msg(id, text, ok){ var el=$(id); el.textContent=text; el.className='form-msg '+(ok?'ok':'err'); }

/* tabs */
$('tabLogin').onclick=function(){ setTab('login'); };
$('tabReg').onclick=function(){ setTab('reg'); };
function setTab(which){
 $('tabLogin').classList.toggle('active', which==='login');
 $('tabReg').classList.toggle('active', which==='reg');
 $('loginForm').hidden = which!=='login';
 $('regForm').hidden = which!=='reg';
}

/* paste band on confirm password */
['paste','drop'].forEach(function(ev){
 $('regPass2').addEventListener(ev, function(e){ e.preventDefault(); msg('regErr','Confirm password me paste nahi hoga, type kar ke likhiye.', false); });
});

/* puzzle captcha */
var CAPCOLORS=['#e2545a','#5a8fe2','#54b06a','#e2a54a','#9a5ae2'];
var capFirst=0, capSecond=0, capSel=-1, capAnswer=-1;
function buildCaptcha(){
 capFirst=Math.floor(Math.random()*CAPCOLORS.length);
 do { capSecond=Math.floor(Math.random()*CAPCOLORS.length); } while(capSecond===capFirst);
 capAnswer=capFirst; capSel=-1;
 var seq=$('captchaSeq'); seq.innerHTML='';
 [capFirst,capSecond,capFirst].forEach(function(ci){
  var t=document.createElement('div'); t.className='tile'; t.style.background=CAPCOLORS[ci]; seq.appendChild(t);
 });
 var q=document.createElement('div'); q.className='tile q'; q.textContent='?'; seq.appendChild(q);
 var opts=$('captchaOpts'); opts.innerHTML='';
 var order=[capFirst];
 while(order.length<4){ var r=Math.floor(Math.random()*CAPCOLORS.length); if(order.indexOf(r)===-1) order.push(r); }
 for(var i=order.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var tmp=order[i]; order[i]=order[j]; order[j]=tmp; }
 order.forEach(function(ci){
  var t=document.createElement('div'); t.className='tile'; t.style.background=CAPCOLORS[ci];
  t.onclick=function(){ capSel=ci; document.querySelectorAll('.captcha-opts .tile').forEach(function(x){ x.classList.remove('sel'); }); t.classList.add('sel'); };
  opts.appendChild(t);
 });
}
buildCaptcha();

/* registration */
$('regForm').onsubmit=function(e){
 e.preventDefault();
 var name=$('regName').value.trim(), mobile=$('regMobile').value.trim(), email=$('regEmail').value.trim(), p1=$('regPass').value, p2=$('regPass2').value;
 if(name.length<3){ msg('regErr','Pura naam likhiye.',false); return; }
 if(!/^\d{10}$/.test(mobile)){ msg('regErr','Mobile 10 digit ka hona chahiye.',false); return; }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ msg('regErr','Sahi Gmail (email) likhiye.',false); return; }
 if(p1.length<6){ msg('regErr','Password kam se kam 6 akshar ka rakhiye.',false); return; }
 if(p1!==p2){ msg('regErr','Confirm password match nahi kar raha.',false); return; }
 if(capSel!==capAnswer){ msg('regErr','Puzzle galat. Sahi tile chun kar dobara try kijiye.',false); buildCaptcha(); return; }
 var all=users();
 for(var i=0;i<all.length;i++){ if(all[i].email===email || all[i].mobile===mobile){ msg('regErr','Ye email ya mobile pehle se registered hai. Login kijiye.',false); return; } }
 all.push({name:name,mobile:mobile,email:email,pass:p1,at:Date.now()});
 lsSet('ao_users',all);
 msg('regErr','Registration ho gaya! Ab Login kijiye.',true);
 $('regForm').reset(); buildCaptcha();
 setTimeout(function(){ setTab('login'); $('loginId').value=email; $('regErr').textContent=''; },1400);
};

/* login */
$('loginForm').onsubmit=function(e){
 e.preventDefault();
 var id=$('loginId').value.trim().toLowerCase(), pass=$('loginPass').value;
 var all=users(), found=null;
 for(var i=0;i<all.length;i++){ if(all[i].email.toLowerCase()===id || all[i].mobile===id) { found=all[i]; break; } }
 if(!found){ msg('loginErr','Ye account nahi mila. Pehle New User Registration kijiye.',false); return; }
 if(found.pass!==pass){ msg('loginErr','Password galat hai.',false); return; }
 lsSet('ao_session',{email:found.email});
 enterHome();
};

/* home render */
function renderRooms(){
 var g=$('roomsGrid'); g.innerHTML='';
 ROOMS.forEach(function(r,i){
  var c=document.createElement('article'); c.className='room-card'; c.style.animationDelay=(i*0.08)+'s';
  c.innerHTML='<img src="'+r.img+'" alt="'+r.name+'"><div class="room-body"><h3>'+r.name+'</h3><p class="room-feat">'+r.feat+'</p><p class="room-price">Rs '+r.p.n+' / raat</p><span class="book-tag">BOOK KARO</span></div>';
  c.onclick=function(){ openBooking(r); };
  g.appendChild(c);
 });
}
function renderFac(){
 var g=$('facGrid'); g.innerHTML='';
 FAC.forEach(function(f){ var d=document.createElement('div'); d.className='fac'; d.innerHTML='<b>'+f[0]+'</b><span>'+f[1]+'</span>'; g.appendChild(d); });
}
function renderRates(){
 var t=$('ratesTable');
 var rows='<tr><th>Room</th><th>3 ghante</th><th>6 ghante</th><th>Puri raat</th></tr>';
 ROOMS.forEach(function(r){ rows+='<tr><td>'+r.name+'</td><td>Rs '+r.p['3']+'</td><td>Rs '+r.p['6']+'</td><td>Rs '+r.p.n+'</td></tr>'; });
 rows+='<tr><td>Check-in / Checkout</td><td colspan="3">24x7 check-in, checkout 11 AM</td></tr>';
 t.innerHTML=rows;
}
function typeText(){
 var el=$('heroTitle'), text=el.getAttribute('data-text'), i=0;
 el.innerHTML='';
 (function tick(){
  if(i<=text.length){ el.innerHTML=text.slice(0,i)+'<span class="caret">|</span>'; i++; setTimeout(tick,45); }
  else { el.innerHTML=text; }
 })();
}
function enterHome(){
 renderRooms(); renderFac(); renderRates(); typeText(); show('homeView');
}

/* booking */
var curRoom=null;
function openBooking(r){
 curRoom=r;
 var u=currentUser();
 $('bookRoomTitle').textContent='Booking: '+r.name;
 $('bkName').value=u?u.name:'';
 $('bkMobile').value=u?u.mobile:'';
 $('bkEmail').value=u?u.email:'';
 $('bkPan').value=''; $('bkAadhaar').value=''; $('bkAddress').value='';
 var d=new Date(); $('bkDate').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 $('bkDur').value='3'; calcTotal();
 $('bookFormWrap').hidden=false; $('bookDone').hidden=true;
 $('bookModal').hidden=false;
}
function calcTotal(){
 if(!curRoom) return;
 var d=$('bkDur').value;
 $('bkTotal').textContent='Rs '+curRoom.p[d];
}
$('bkDur').onchange=calcTotal;
$('modalX').onclick=function(){ $('bookModal').hidden=true; };
$('bookModal').onclick=function(e){ if(e.target===$('bookModal')) $('bookModal').hidden=true; };
$('bookForm').onsubmit=function(e){
 e.preventDefault();
 var name=$('bkName').value.trim(), mobile=$('bkMobile').value.trim(), email=$('bkEmail').value.trim();
 var pan=$('bkPan').value.trim().toUpperCase(), aadhaar=$('bkAadhaar').value.trim(), address=$('bkAddress').value.trim();
 var date=$('bkDate').value, time=$('bkTime').value, dur=$('bkDur').value;
 if(name.length<3){ alert('Pura naam likhiye.'); return; }
 if(!/^\d{10}$/.test(mobile)){ alert('Mobile 10 digit ka hona chahiye.'); return; }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Sahi Gmail likhiye.'); return; }
 if(!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)){ alert('PAN galat hai. Format: ABCDE1234F'); return; }
 if(!/^\d{12}$/.test(aadhaar)){ alert('Aadhaar 12 digit ka hona chahiye.'); return; }
 if(address.length<10){ alert('Pura address likhiye.'); return; }
 if(!date){ alert('Date chuniye.'); return; }
 var d=new Date(); var today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 if(date<today){ alert('Aaj ya aage ki date chuniye.'); return; }
 var u=currentUser();
 var bk={ id:'AO-'+Math.floor(100000+Math.random()*900000), owner:u?u.email:email, roomId:curRoom.id, room:curRoom.name,
  name:name, mobile:mobile, email:email, pan:pan, aadhaar:aadhaar, address:address, date:date, time:time, dur:dur,
  total:curRoom.p[dur], at:Date.now() };
 var all=lsGet('ao_bookings')||[]; all.push(bk); lsSet('ao_bookings',all);
 $('doneText').innerHTML='Booking ID: <b>'+bk.id+'</b><br>'+bk.room+'<br>'+bk.date+' · '+bk.time+'<br>Total: Rs '+bk.total;
 $('bookFormWrap').hidden=true; $('bookDone').hidden=false;
};
$('doneOk').onclick=function(){ $('bookModal').hidden=true; $('bookForm').reset(); calcTotal(); };

/* my bookings */
$('myBookingsBtn').onclick=function(){
 var u=currentUser(); if(!u) return;
 var all=(lsGet('ao_bookings')||[]).filter(function(b){ return b.owner===u.email; }).reverse();
 var box=$('bookingsList'); box.innerHTML='';
 if(all.length===0){ box.innerHTML='<p class="disc">Abhi koi booking nahi hui. Rooms section se book kijiye.</p>'; }
 all.forEach(function(b,i){
  var r=document.createElement('div'); r.className='booking-row'; r.style.animationDelay=(i*0.07)+'s';
  r.innerHTML='<b>'+b.id+'</b> · '+b.room+'<div class="meta">'+b.name+' · '+b.mobile+'<br>'+b.date+' · '+b.time+' · '+(b.dur==='n'?'Puri raat':b.dur+' ghante')+'<br>Total: Rs '+b.total+'</div>';
  box.appendChild(r);
 });
 $('mybookings').hidden=false;
 $('mybookings').scrollIntoView({behavior:'smooth'});
};

/* logout */
$('logoutBtn').onclick=function(){ localStorage.removeItem('ao_session'); show('authView'); $('loginPass').value=''; msg('loginErr','',true); };

/* scroll animations */
var io=new IntersectionObserver(function(entries){
 entries.forEach(function(en){ if(en.isIntersecting) en.target.classList.add('in'); });
},{threshold:0.12});
document.querySelectorAll('.section').forEach(function(s){ io.observe(s); });

/* auto login */
if(currentUser()) enterHome();
