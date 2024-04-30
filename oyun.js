const startdiv = document.getElementById("start");
const btn = document.querySelector("#start button");
const ul = document.querySelector("#start ul");
const canvas = document.getElementById("canvas"); // Canvasa erişiyoruz
const killdiv = document.getElementById("kills");
const scorediv = document.getElementById("score");
const width = window.innerWidth; // Pencerenin genişliği kadar
const height = window.innerHeight; // Pencerenin uzunluğu kadar
canvas.width = width; 
canvas.height = height;

const ctx = canvas.getContext("2d"); // 2d çizim yapmak için kullanıyoruz.

// playerın mouse istikametinde dönmesi için mouse istikametini buluyoruz 
canvas.addEventListener("mousemove",(e)=>{
	if(playing){
		var dx = e.pageX - player.x; // mouse nin bulunduğu x den playerın x ini 
		var dy = e.pageY - player.y; // mouse nin bulunduğu y den playerın y sini çıkardık.
		var açı = Math.atan2(dy,dx); // atan2 fonksiyonu verilen x fonksiyonu ile y fonksiyonu arasındaki açıyı radyan cinsinden döndürüyor
		açı *= 180 / Math.PI; // açıyı radyandan dereceye çeviriyoruz.
		angle = açı;
	}
});

// ateş etme eventi 
canvas.addEventListener("click",(e)=>{
	if(playing){
	bullets.push(new Circle(player.x,player.y,e.pageX,e.pageY,5,'white',7));
	}
	
});

class Player{
	constructor(x,y,r,c){
	this.x = x; // x koordinatı 
	this.y = y;	// y koordinatı 
	this.r = r;	// çapı 
	this.c = c;	// rengi 	
	}
	draw(){ // Playerı çizen fonksiyon
		ctx.save();// canvası kaydet 
		ctx.translate(this.x,this.y); // sayfanın ortasına taşıma işlemi
		ctx.rotate(angle * Math.PI / 100);//playerı mouse yönünde çeviriyoruz
		ctx.fillStyle = this.c; // rengini belirtiyoruz
		ctx.beginPath(); // Path açıyoruz
		ctx.arc(0,0,this.r,0,Math.PI * 2); // daire çiziyoruz(this.r çapında 0 konumundan başlayan PI*2 kadar devam eden bir daire çiziyoruz.)
		ctx.fillRect(0,-(this.r * .3),this.r + 10,this.r * .6); //dairenin ucuna silah namlusu gibi bir diktörtgen çiziyoruz(this.r + 10 (namlu uzunluğu),this.r + .6(namlu genişliği))
		ctx.fill();
		ctx.closePath(); // Path i kapatıyoruz
		ctx.restore(); // save ve restore yi playerı döndürmek için kullanıyoruz.
	}
}
	
class Circle{ // mermi sınıfı
	constructor(px,py,tx,ty,r,c,s){
		this.px = px;
		this.py = py;	
		this.tx = tx;// hedef(target x)
		this.ty = ty;
		this.x = px;
		this.y = py;
		this.r = r;	//çap
		this.c = c; //renk
		this.s = s;	// hız		
	}
    draw(){ // mermileri çiz 
		ctx.fillStyle = this.c; // renk 
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.r,0,Math.PI * 2); // daire şeklinde mermilerimizi çiziyoruz 
		ctx.fill();
		ctx.closePath();
		}
	update(){ // mermileri hareket ettiren fonksiyon
		var dx = this.tx - this.px;
		var dy = this.ty - this.py;
		var hipotenüs = Math.sqrt(dx * dx + dy * dy);
		this.x += (dx / hipotenüs) * this.s;
		this.y += (dy / hipotenüs) * this.s;
	}
	remove(){ // ekranın dışına çıkan mermileri sil
		if((this.x < 0 || this.x > width) || (this.y < 0 || this.y > height)){ // mermiler dılarıdaysa true döndür.
			return true;
		}
		return false; // mermiler dışarıda değilse false döndür.
	}
}

function addEnemy(){
	for(var i= enemies.length; i < maxenemy; i++){ // bir düşman gittiğinde yerine başkası gelsin
		var r = Math.random() * 30 + 10; // her bir düşmanın yarıçapını  10 ile 40 arasında random olarak alıyoruz
		var c = 'hsl('+(Math.random() * 360)+',80%,70%)'; //hsl(0 ile 360 arasında bir açı bu rengi belirler,rengin ne kadar uygulanacağı,rengin parlaklığı)
		var s = .5 + ((40 -((r/40) * r)) / 160) / maxenemy; // düşman hızını çapı küçük olan daha hızlı olacak şekilde ve düşman sayısı arttığında yavaşlayacak şekilde ayarlıyoruz.

		var x,y; // koordinatlar
		if(Math.random() < .5){// düşmanların farklı yönlerden gelmesi için if else bloğunu yarıya böldüm
			x = (Math.random() > .5) ? width : 0;
			y = Math.random() < height;
		}else{
			x = Math.random() * width;
			y = (Math.random() < .5) ? height : 0;
				
		}
		enemies.push(new Circle(x,y,player.x,player.y,r,c,s));
	}
}

function collision(x1,y1,r1,x2,y2,r2){ // kesişme fonksiyonu
	var dx = x1 - x2 
	var dy = y1 - y2
	var hipotenüs = Math.sqrt(dx * dx + dy * dy);
	if(hipotenüs <(r1 + r2)){// hipotenüs uzunluğu player ile düşmanların çapının uzunluğundan kısa ise bunlar birbirine dokunmuştur.
		return true;
	}
		return false;
}

function animate(){ // animasyon fonksiyonu
	if(playing){
		requestAnimationFrame(animate); // kendisini tekrar çağırarak animasyonun başlamasını sağlıyor
		//ctx.clearRect(0.0.width,height);
		ctx.fillStyle = "rgba(1,1,1,.1)";
		ctx.fillRect(0,0,width,height);
		ctx.fill();
		enemies.forEach((enemy,e) => {
			bullets.forEach((bullet,b) => { 
				if(collision(enemy.x,enemy.y,enemy.r,bullet.x,bullet.y,bullet.r)){ // eğer bullet ile düşmanlar çarptığında  
					if(enemy.r < 15){ // eğer çapı 15 den küçükse
						enemies.splice(e,1); // enemie yi sil
						score += 25; // skoru 25 artır
						kills++; // kill sayısını artır
						if(kills % 5 === 0){ // her 5 kill de bir
							maxenemy ++; // düşman sayısını bir artır
						}
						addEnemy();//her düşman silindiğinde yeni bir düşman ekle
					}else{
						enemy.r -= 5; // eğer çapı 15 den büyükse her vurulduğunda çağı 5 azalsın
						score += 5; // skorumuzda 5 artsın
					}
					
					bullets.splice(b,1); // her düşmana vurulduğunda mermiler de yok olsun
				}
			});
			
			if(collision(enemy.x,enemy.y,enemy.r,player.x,player.y,player.r)){ // eğer düşman dokunduysa
				startdiv.classList.remove("hide");
				btn.textContent = "TEKRAR DENE";
				ul.innerHTML = "Oyun bitti : <br/> Puanın: " + score;
				playing = false; // oyunu bitir
			}
			
			if(enemy.remove()){ // düşmanlar silindiyse 
				enemies.splice(e,1); // düşmanı sil
				addEnemy(); // ve yenisini ekle
			}
			enemy.update();
			enemy.draw();
		});
			
		bullets.forEach((bullet,b) => {
			if(bullet.remove()){ // eğer mermiler dışarıdaysa (satır 81)
				bullets.splice(b,1); // mermiyi sil
			}
			bullet.update(); // her bir mermi için mermileri çizme ve hareket ettirme fonksiyonunu çağırıyoruz
			bullet.draw();
		});
		player.draw(); // playerımızı çizen fonksiyonu çağırıyoruz
		scorediv.innerHTML = "Skor : " + score;
		killdiv.innerHTML = "Kill : " + kills;
	}
}
	
function init(){ // değişkenlerimizi init fonksiyonunda tanımlıyoruz
	playing = true; // oyun init olduysa oyunu başlatması için playingi true yaptım
	score = 0; // oyun skoru
	kills = 0; // kill sayısı
	angle = 0; // playerı döndüren açı 
	bullets = []; // mermi
	enemies = []; // düşman
	maxenemy = 1; // düşman sayısı
	startdiv.classList.add("hide");
	
	player = new Player(width/2,height/2,15,"white"); // x ve y koordinatlarını sayfanın tam ortasına olacak şekilde ayarlıyoruz çapı 15 rengide beyaz yapıyoruz.
	addEnemy(); // animasyon ve düşman ekle fonksiyonlarını init içerisinde çağırıyoruz.
	animate();
}
