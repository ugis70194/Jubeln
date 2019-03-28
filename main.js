const timeRender = Vue.component('time-render',{
    template:
    `
    <div>
        <p>
            到着したい時刻: <input type='time' v-model='wantArrive'> 
        </p>
        <p> 現在:{{ hour }}時{{ min }}分 </p>
        <p> 所要時間: {{ taketime }} 分 </p>
        <p> {{ getBefore }} </p>
        <p> {{ getAfter }} </p>
    </div>
    `,
    data: function(){
        return {
            wantArrive: null,
            getNowTimer: null,
            taketime: 0,
            hour: 0,
            min: 0,
        }
    },
    computed:{
        getBefore(){
            let hour = this.hour
            let min = this.min
            if(min - 15 < 0){
                if(hour == 0) hour = 23
                else {
                    hour -= 1
                    min = 60 - (15-min)
                }
            }
            else min -= 15
            hour = hour.toString()
            min = min.toString()

            let before = '15分前:' + hour + '時' + min + '分'

            return before
        },
        getAfter(){
            let hour = this.hour
            let min = this.min
            if(min + 60 < 0){
                if(hour == 23) hour = 0
                else {
                    hour += 1
                    min = 15 - (60-min)
                }
            }
            else min += 15
            hour = hour.toString()
            min = min.toString()

            let after = '15分後:' + hour + '時' + min + '分'

            return after
        }
    },
    methods: {
        getNow(){
            let now = new Date();
            this.hour = now.getHours();
            this.min = now.getMinutes();
            this.taketime = window.taketime
        }
    },
    mounted(){
        this.getNowTimer = setInterval(this.getNow,250)
    },
    destroyed() {
        clearInterval(this.getNow)
    },
})

let runningCheck = Vue.component('running-check',{
    template:
    `
    <div>
        {{ ax }} <br>
        {{ ay }} <br>
        {{ az }} <br>
        {{ sumAcceleration }} <br>
        <h1> {{ text }} </h1> 
    </div>
    `,
    data: function(){
        return { 
            ax: 0,
            ay: 0,
            az: 0,
            sumAcceleration: 0,
            averageSumAcceleration: 0,
            text: null,
            updateAccelerationTimer: null,
        }
    },
    watch:{
        averageSumAcceleration(newAcc, oldAcc){
            if(newAcc > 0 && oldAcc > 0){
                //this.text = 'Fight!'
                this.text = 'がんばれ♡がんばれ♡'
                this.count++
            }
            //else if(this.text === 'Fight!' && newAcc < 4) this.text = null
            else if(this.text === 'がんばれ♡がんばれ♡' && newAcc < 0) this.text = null
        }
    },
    methods: {
        getAcceleration(dat){
            this.ax = Math.abs(dat.acceleration.x) 
            this.ay = Math.abs(dat.acceleration.y) 
            this.az = Math.abs(dat.acceleration.z) 
        },
        updateAcceleration(){
            this.sumAcceleration =  this.ax + this.ay + this.az
            this.averageSumAcceleration = (this.averageSumAcceleration + this.sumAcceleration) / 2
        },
    },
    mounted(){
        window.addEventListener('devicemotion', this.getAcceleration, false)
        this.updateAccelerationTimer = setInterval(this.updateAcceleration, 500)
    },
    destroyed() {
        window.removeEventListener('devicemotion', this.getAcceleration, false)
        clearInterval(this.updateAcceleration)
    },
})

function distance(latlng1,latlng2){
    var str1 = new String(latlng1.toString());
    var str2 = new String(latlng2.toString());
    var d1 = str1.split(',');
    var d2 = str2.split(',');
    var radLat1=parseFloat(d1[0])*(Math.PI/180);
    var radLng1=parseFloat(d1[1])*(Math.PI/180);
    var radLat2=parseFloat(d2[0])*(Math.PI/180);
    var radLng2=parseFloat(d2[1])*(Math.PI/180);
    var equator = 6377397.155;
    var r = 6356078.963;
    var e2 = 0.00667436061028297;
    var ale2 = 6334832.10663254;
    var radLatDiff = radLat1-radLat2;
    var radLngDiff = radLng1-radLng2;
    var radLatAve = (radLat1+radLat2)/2.0;
    var sinLat = Math.sin(radLatAve);
    var w2 = 1.0 - e2 *(sinLat*sinLat);
    var m = ale2 / (Math.sqrt(w2)*w2);
    var n = equator / (Math.sqrt(w2));
    var t1 = m * radLatDiff;
    var t2 = n * (Math.cos(radLatAve))*radLngDiff;
    var dist = Math.sqrt((t1*t1)+(t2*t2));
    var taketime = parseInt(dist/70+0.5);
    //alert("dist");
    //alert(dist.toString());
    //alert(taketime.toString());

    return taketime;
}
function btn1Click(){
    //alert("Click 1");
    navigator.geolocation.getCurrentPosition(function(position){
        var lat=position.coords.latitude;
        var lng=position.coords.longitude;
        start=new Y.LatLng(lat,lng);

        ymap.drawMap(start, 15, Y.LayerSetId.NORMAL);  
        ymap.removeLayer(layer);
        
        var data=new Array();
        data.push(start);
        data.push(goal);
        //alert(start.toString());
        //alert(goal.toString());
        layer.execute(data);
        ymap.addLayer(layer);
        window.taketime = distance(start,goal);
    });
}

let mapRender = Vue.component('map-render',{
    template:
    `   
        <div>
            <div id="map" style="width:800px; height:600px"></div>
            <input type="button" id="btn1" value="更新" onclick="btn1Click()" />
        </div>
    `,
    methods:{
        window:onload = function OpenMap(){
            ymap = new Y.Map("map",{
                configure:{
                    scrollWheelZoom : true
                },
                
            });
            ymap.setConfigure('mapType',Y.Map.TYPE.SMARTPHONE)
            //alert("Open");
            ymap.addControl(new Y.CenterMarkControl());
            ymap.addControl(new Y.LayerSetControl());
            ymap.addControl(new Y.ScaleControl());
            ymap.addControl(new Y.SliderZoomControlHorizontal());
            ymap.addControl(new Y.HomeControl());
        
            layer = new Y.RouteSearchLayer();
            
            navigator.geolocation.getCurrentPosition(function(position){
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                start = new Y.LatLng(lat, lng);
                goal=start;
                ymap.drawMap(start, 15, Y.LayerSetId.NORMAL);
            });
            
            ymap.bind('click',function (latlng){
                //console.log(latlng);
                ymap.drawMap(latlng, 15,Y.LayerSetId.NORMAL);
                ymap.removeLayer(layer);
                goal=latlng;
                //alert(goal.toString());
                var data=new Array();
                data.push(start);
                data.push(goal);
        
                layer = new Y.RouteSearchLayer();
                layer.execute(data,{
                    useCar : false
                });
                ymap.addLayer(layer);
        
                window.taketime = distance(start,goal);
            });
        },
    }
})

new Vue({
    el: '#app',
    components:{
        'time-render': timeRender,
        'running-check': runningCheck,
        'map-render': mapRender,
    },
})