var momentHistory = [];
var curvatureHistory = [];

function findzero(arr) {
    var id = [0] //becomes array, just number w/o []
    var k = 0
    for (let i = 0; i < (arr.length - 1); i++) {
        if (Math.sign(arr[i]) == 0) {
            id[k] = i
            k++
        } else if (Math.sign(arr[i]) != Math.sign(arr[i + 1])) {
            id[k] = i
            k++
        }
    }
    return id
}

function drawfunc(geo) {
    let w = geo.b
    let h = geo.h;
    let nbars = geo.nbars;
    let nbars_p = geo.nbars_p;
    let dbar = geo.dbar;
    let dbar_p = geo.dbar_p;
    let nmax = math.floor((w - 2 * (dbar + 0.01)) / (2 * dbar))
    if (nbars <= nmax) {
        layers = 1;
        layer1 = nbars;
        d = h - (1.5 * dbar + 0.01);
    }
    else if (nbars > nmax) {
        let layers = 2;
        layer1 = nmax;
        layer2 = nbars - nmax;
        d = h - (layer2 * (2.5 * dbar + 0.01) + layer1 * (1.5 * dbar + 0.01)) / (nbars)
    }
    d_p = (1.5 * dbar_p + 0.01)
    //x-y-location of bottom bars
    var barXSpace = (w - (3 * dbar + (2 * 0.01)));
    if (nbars > nmax && layer2 > 1) {
        var x_bar1 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
        var x_bar2 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer2 - 1), true)._data
        var x_bar = x_bar1.concat(x_bar2);
    }
    else if (nbars == 1) {
        x_bar = [geo.b/2]
    }
    else if (nbars > nmax && layer2 == 1) {
        var x_bar1 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
        var x_bar = x_bar1.concat([w / 2]);
    }
    else if (nbars <= nmax) {
        var x_bar = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
    }

    var y_bar = []
    for (let i = 0; i <= nbars; i++) {
        if (i < nmax) {
            y_bar[i] = dbar + 0.01 + 0.5 * dbar;
        }
        else {
            y_bar[i] = dbar + 0.01 + 0.5 * dbar + dbar + dbar;
        }
    }

    //x-y-location of top bars
    var barpXSpace = (w - (3 * dbar_p + (2 * 0.01)));
    if (nbars_p<2) {
        var x_bar_p = [geo.b/2]
        y_bar_p = h - 0.01 - 1.5 * dbar_p;    
    } else {
    var x_bar_p = math.range(0.01 + 1.5 * dbar_p, w - 1.5 * dbar_p - 0.01, barpXSpace / (nbars_p - 1), true)._data
    y_bar_p = h - 0.01 - 1.5 * dbar_p;
    }
    //draw cross section
    section_geom = [
        {
            type: 'rect', x0: 0, y0: 0, x1: w, y1: h, line: { color: 'rgba(0, 0, 0, 1)', width: 2 }, fillcolor: 'rgba(150, 150, 150, 0.3)',
        },
    ]

    //draw bottom bars
    var new_circle = [];
    for (let i = 0; i < nbars; i++) {
        new_circle[i] = {
            type: 'circle', x_ref: 1, y_ref: 1, x0: x_bar[i] - 0.5 * dbar, y0: y_bar[i] - 0.5 * dbar, x1: x_bar[i] + 0.5 * dbar, y1: y_bar[i] + 0.5 * dbar, fillcolor: 'rgba(0, 0, 0, 1)',line:{color:'rgba(0,0,0,0)'}
        }
    }
    section_geom = section_geom.concat(new_circle)

    //draw upper bars
    var new_circle_p = []
    for (let i = 0; i < nbars_p; i++) {
        new_circle_p[i] = {
            type: 'circle', x_ref: 1, y_ref: 1, x0: x_bar_p[i] - dbar_p / 2, y0: y_bar_p - dbar_p / 2, x1: x_bar_p[i] + dbar_p / 2, y1: y_bar_p + dbar_p / 2, fillcolor: 'rgba(0, 0, 0, 1)',line:{color:'rgba(0,0,0,0)'}
        }
    }
    section_geom = section_geom.concat(new_circle_p)
}

function calcMtrl() {
    num = 300;
    f_cm = document.getElementById("fc").value * 1e6
    eps_cu = 3.5e-3;
    eps_c1 = (0.7 * (f_cm * 10 ** -6) ** 0.31) * 10 ** -3;
    eps_c2 = 2e-3;
    eps_c3 = 1.75e-3;
    E_cm = 30e9;
    f_ctm = 2.2e6;
    eps_c = math.range(0, eps_cu, eps_cu / num, true)._data;
    var n = math.divide(eps_c, eps_c1);
    var k = 1.05 * E_cm * math.abs(eps_c1) / f_cm;
    var a = math.multiply(f_cm, math.subtract(math.multiply(k, n), math.square(n)));
    var b = math.add(math.multiply(k - 2, n), 1);
    sigma_c = math.dotDivide(a, b);
    f_yd = document.getElementById("fy").value * 1e6;
    E_s = 200e9;
    eps_sy = f_yd / E_s;
    eps_s = math.range(0, 2e-2, 2e-2 / num)._data
    mtrl_sigma_s = eps_s.map(x=>x<=eps_sy?x*E_s:f_yd);
}

function calcGeometry() {
    //Geometry and reinforcement
    geo = {};
    $(".geom").each(function () {
        geo[$(this).attr("id")] = $(this).val();
    });
    geo.b /= 1000
    geo.h /= 1000
    geo.dbar /= 1000
    geo.dbar_p /= 1000

    geo.A_s = geo.nbars * (geo.dbar / 2) ** 2 * Math.PI;
    geo.A_sp = geo.nbars_p * (geo.dbar_p / 2) ** 2 * Math.PI;

    //calculate d and d_p from geometry
    drawfunc(geo)

}

function calc() {
    crackCheck = [];
    id_zeroCracked = [];
    id_zeroUncracked = [];
    Mc = [0];
    Fs_out = [];
    Fc_out = []
    Fsp_out = [];
    Fct_out = [];
    curvature = [0];
    yc_out = [];
    xc_out = [];
    cncrt_tp = [];
    sigma_s_out = [0];
    sigma_sp_out = [0];
    eps_c_out = [0];
    sigma_cb_out = [0];
    eps_s1_out = [0];
    eps_sp_out = [0];
    A_s = geo.A_s;
    A_sp = geo.A_sp;
    b = geo.b;
    h = geo.h;
    NA = [];
    var xn = math.range(d_p, d - d_p, d / 500, true);
    var id_zero = [0];
    xn = xn._data;
    //Calculate location of NA
    for (let i = 1; i < eps_c.length; i++) {
        //Get smaller part of stress strain curve
        let eps_c_sub = eps_c.slice(0, i + 1);
        eps_c_out[i] = eps_c_sub[eps_c_sub.length - 1];
        let sigma_sub = sigma_c.slice(0, i + 1);
        let sigma_sub_mean = math.mean(sigma_sub);
        //stress in top and bottom reinforcement at different x and different eps_c_max
        var sigma_s = math.dotMultiply(math.dotMultiply(math.dotDivide(math.max(eps_c_sub), xn), math.subtract(d, xn)), E_s);
        sigma_s = sigma_s.map(a => a > f_yd ? f_yd : a); //cap at yield stress
        var sigma_sp = math.dotMultiply(math.dotMultiply(math.dotDivide(math.max(eps_c_sub), xn), math.subtract(xn, d_p)), E_s);
        sigma_sp = sigma_sp.map(a => a > f_yd ? f_yd : a); //cap at yield stress
        //force equilibrium Fcc - Fs - Fct = 0, iterate for different x
        let forceT2 = math.dotMultiply(sigma_s, A_s); //force tensile reinforcement
        eps_cb = xn.map((a,j) => (eps_c[i]*(h-xn[j])/xn[j]))
        let forceTensionBlock = xn.map((a,j) => E_cm*(h-xn[j])*b*0.5*eps_cb[j])
        let forceT1 = math.add(math.dotMultiply(sigma_s, A_s),forceTensionBlock); //force tensile side
        
        let forceC = math.add(math.dotMultiply(sigma_sub_mean * b, xn), math.dotMultiply(sigma_sp, A_sp)) //force compression
        let forceEqCracked = math.subtract(forceC, forceT2); //force equilibrium cracked tensile side
        let forceEqUncracked = math.subtract(forceC, forceT1); //force equilibrium uncracked tensile side
        id_zeroCracked[i] = findzero(forceEqCracked); //find zero crossing x, cracked
        id_zeroUncracked[i] = findzero(forceEqUncracked); //find zero crossing x, uncracked
        
        if (eps_cb[id_zeroUncracked[i]]*E_cm > f_ctm) {
            id_zero[i] = id_zeroCracked[i]
            crackCheck[i] = true
        } else {
            id_zero[i] = id_zeroUncracked[i]
            crackCheck[i] = false
        }
        
        yc_out[i] = math.range(d - xn[id_zero[i]], d, (d - (d - xn[id_zero[i]])) / (eps_c_sub.length - 1), true);
        yc_out[i] = yc_out[i]._data;
        yc_out[i] = math.add(yc_out[i], h - d)

        // eps_c/x = eps_cb/(h-x)
        // => eps_cb = eps_c*(h-x)/x 

        xc_out[i] = math.divide(sigma_sub, 1000000);

        sigma_s_out[i] = sigma_s[id_zero[i]] / 1000000;
        sigma_sp_out[i] = sigma_sp[id_zero[i]] / 1000000;
        eps_s1_out[i] = math.max(eps_c_sub) * (d - xn[id_zero[i]]) / (xn[id_zero[i]])
        eps_sp_out[i] = math.max(eps_c_sub) * (xn[id_zero[i]] - d_p) / (xn[id_zero[i]])
        sigma_cb_out[i] = -E_cm*eps_cb[id_zero[i]]/10000000

        cncrt_tp[i] = math.divide(math.sum(math.dotMultiply(sigma_sub, yc_out[i])), math.sum(sigma_sub))
        curvature[i] = 1 / ((d - xn[id_zero[i]]) / eps_s1_out[i])
        NA[i] = xn[id_zero[i]]
        Fs = sigma_s_out[i] * A_s * 1e3
        Fs_out[i] = Fs;
        Fsp = sigma_sp_out[i] * A_sp * 1e3
        Fsp_out[i] = Fsp;
        Fc = sigma_sub_mean * b * xn[id_zero[i]] / 1e3
        Fc_out[i] = Fc;
        Fct = 0.5 * eps_cb[id_zero[i]] * E_cm * b * (h-xn[id_zero[i]]) / 1e3 
        Fct_out[i] = Fct;
        if (crackCheck[i]) {
        Fct_out[i] = 0;
        }
        if (crackCheck[i]) {
            Mc[i] = Fc * (cncrt_tp[i]-(h-xn[id_zero[i]])) +
                    Fsp * (xn[id_zero[i]]-d_p) + 
                    Fs * [d-xn[id_zero[i]]] 
        } else {
            Mc[i] = Fc * (cncrt_tp[i]-(h-xn[id_zero[i]])) +
                    Fsp * (xn[id_zero[i]]-d_p) + 
                    Fs * (d-xn[id_zero[i]]) + 
                    Fct * ((h-xn[id_zero[i]])*2/3)
        }
    }
    momentHistory=momentHistory.concat(...[Mc,null])
    curvatureHistory=curvatureHistory.concat(...[curvature,null])
    sigma_cb_out = sigma_cb_out.map((x,i) => crackCheck[i] ? 0:x)
    //Draw polygons from strss and strain distributions
    pathdefs = []
    for (let i = 1; i < xc_out.length; i++) {
        pathdef = 'M0,' + h
        
        for (let j = 0; j < xc_out[i].length; j++) {
            substr = 'L' + Math.round(xc_out[i][j] * 10) / 10 + ',' + Math.round(yc_out[i][j]*1000)/1000;
            pathdef = pathdef.concat(substr)
        }
        pathdefs[i] = pathdef + 'L0,' + h + 'Z';
    }
    pathdefsT = [];
    for (let i = 1; i < xc_out.length; i++) {
        pathdefT = 'M0,0'
        substr = 'L' + Math.round(sigma_cb_out[i]*10) + ',0L0,' + Math.round(xn[id_zero[i]]*100)/100 + ',0Z'
        pathdefsT[i] = pathdefT.concat(substr)
        }

    return
}

function plotFunc() {
    var slider = document.getElementById("myRange")
    k = parseInt(slider.value)*num/100;
    ax = document.getElementById('myDiv');
    ax2 = document.getElementById('myDiv2');
    ax3 = document.getElementById('myDiv3');
    let w = geo.b;
    let h = geo.h;
    //Define data
    stress_dist_shape = {
        type: 'path', path: pathdefs[k], line: { width: 1, color: 'rgb(0,0,0)' }, fillcolor: 'rgba(0,0,255,0.5)',
        xref: 'x2', yref: 'y2'
    }
    
    stress_dist_shapeT = {
        type: 'path', path: pathdefsT[k], line: { width: (!crackCheck[k] ? 1:0), color: 'rgb(0,0,0)' }, fillcolor: 'rgba(255,0,0,0.5)',
        xref: 'x2', yref: 'y2',
    }
    
    var trace11 = {
        x: [0, -sigma_s_out[k] / (10)],
        y: [h - d, h - d],
        xaxis: 'x2', yaxis: 'y2', mode: 'lines+markers',
        line: {color:'red'}
    }

    
    var trace12 = {
        x: [0, sigma_sp_out[k] / (10)],
        y: [h - d_p, h - d_p],
        xaxis: 'x2', 
        yaxis: 'y2',
        line: {color:'rgb(0,155,0)'},
        mode:geo.nbars_p<1 ? 'none':'scatter',
    }
    var trace13 = {
        x: [eps_c[k], -eps_s1_out[k]],
        y: [h, d_p],
        xaxis: 'x3', yaxis: 'y3', mode: 'lines+markers',
        line:{color:'black'}
    }
    var trace14 = {
        x: 0,
        y: 0,
        mode: 'lines+markers',
    }
    var trace31 = {
        x: curvature.slice(0,k+1),
        y: Mc.slice(0,k+1),
        mode: 'lines',
        line:{width:4,color:'rgb(0,0,255)'}
    }

    var trace32 = {
        x: curvatureHistory,
        y: momentHistory,
        mode: 'lines',
        line: {width:2,color:'rgba(175,175,175,0.5)'}
    }

    var trace23 = {
        x: eps_s.map((x) => -x),
        y: mtrl_sigma_s.map((x) => -x/1000000),
        mode: "lines",
        yaxis: "y",
        showlegend: false,
        line: {color:'rgb(155,155,155)'}
    }

    var trace24 = {
        x: eps_s,
        y: mtrl_sigma_s.map((x) => x/1000000),
        mode: "lines",
        yaxis: "y",
        showlegend: false,
        line: {color:'rgb(155,155,155)'}
    }

    
    let symb_s1 = eps_s1_out[k]>0.005?'arrow-left':'circle-x-open'
    var trace25 = {
        x: [eps_s1_out[k]>0.005?-0.005:-eps_s1_out[k], 
        eps_s1_out[k]>0.005?-0.005:-eps_s1_out[k]],
        y: [-sigma_s_out[k], -sigma_s_out[k]],
        mode: "scatter",
        yaxis: "y",
        marker: {color:'red',size:10,symbol:symb_s1},
        name: "Steel, (bottom)",
    }

    var trace27 = {
        x: eps_c,
        y: math.dotDivide(sigma_c,1000000), 
        mode: "lines",
        yaxis: "y2",
        showlegend: false,
        line:{color:'rgb(155,155,155)'},
        marker:{size:100}
    }

    let symb_c1 = k==num?'x':'circle-x-open'
    var trace28 = {
        x: [eps_c_out[k], eps_c_out[k]],
        y: [xc_out[k][xc_out[k].length - 1], xc_out[k][xc_out[k].length - 1]],
        mode: "scatter",
        yaxis: "y2",
        marker: {color:'rgb(0,0,255)',size:10,symbol:symb_c1},
        name: "Concrete, (top)",
    }

    let symb_s2 = eps_sp_out[k]>0.005?'arrow-left':'circle-x-open'
    var trace29 = {
        x: [eps_sp_out[k]>0.005?0.005:eps_sp_out[k], 
        eps_sp_out[k]>0.005?0.005:eps_sp_out[k]],
        y: [sigma_sp_out[k], sigma_sp_out[k]],
        mode: "scatter",
        yaxis: "y",
        marker: {color:'rgb(0,155,0)',size:10,symbol:symb_s2},
        name: "Steel (top)",
    }

    var stressBar = []
    for (let i = 1; i<section_geom.length;i++) {
        if (section_geom[i].y0 < h/2) {
            stressBar[i-1] = structuredClone(section_geom[i])
            let CoG_y = (stressBar[i-1].y0+stressBar[i-1].y1)/2
            let CoG_x = (stressBar[i-1].x0+stressBar[i-1].x1)/2
            let r = ((sigma_s_out[k]*1000000 / f_yd) * (geo.dbar/2)**2)**0.5
            stressBar[i-1].y0 = CoG_y+r
            stressBar[i-1].y1 = CoG_y-r
            stressBar[i-1].x0 = CoG_x+r
            stressBar[i-1].x1 = CoG_x-r
            stressBar[i-1].fillcolor = 'red'
            stressBar[i-1].line.color = 'rgba(0,0,0,0)'
        } else if (section_geom[i].y0 > h/2) {
            stressBar[i-1] = structuredClone(section_geom[i])
            let CoG_y = (stressBar[i-1].y0+stressBar[i-1].y1)/2
            let CoG_x = (stressBar[i-1].x0+stressBar[i-1].x1)/2
            let r = ((sigma_sp_out[k]*1000000 / f_yd) * (geo.dbar_p/2)**2)**0.5
            stressBar[i-1].y0 = CoG_y+r
            stressBar[i-1].y1 = CoG_y-r
            stressBar[i-1].x0 = CoG_x+r
            stressBar[i-1].x1 = CoG_x-r
            stressBar[i-1].fillcolor = 'rgb(0,155,0)'
            stressBar[i-1].line.color = 'rgba(0,0,0,0)'
            
        
    }    
    }    

    alpha =255;
    if (crackCheck[k]) {
        alpha = 0
    }

    
if (!crackCheck[k]) {
var cscale = [
    [0, 'rgb(100,55,0)'],
    [0.5, 'rgb(255,255,255)'],
    [1, 'rgb(0,0,255)'],
    ]
}else{
    var cscale = [
        [0, 'rgb(255,255,255)'],
        [0.5, 'rgb(255,255,255)'],
        [1, 'rgb(0,0,255)'],
        ]
} 


    let z = [];
    for (let i = 0; i<xc_out[k].length;i++){
        z[i] = [xc_out[k][i],xc_out[k][i]]
    }
    z = [[-xc_out[k][xc_out[k].length-1],-xc_out[k][xc_out[k].length-1]],...z]
    
 var surf = [
    {//z:[[1,1],[0,0],[-1,-1]],
    z:z,   
    x:[0,b],
    y:[0,...yc_out[k]],
    type:'contour',
    showscale:true,
    contours: {
        coloring: 'heatmap',    
    },
    colorscale:cscale,
    coloraxis: 'coloraxis',
    line: {width:0.}},
    
 ]

 var config = {responsive: true}  

    var layout = {
        paper_bgcolor:'rgba(0,0,0,0)', 
        grid: {
            rows: 1, columns: 3, pattern: 'independent',
            xgap: 0.2, ygap: 0,
            subplots:['xy2','x2y2','x3y2'],
        },
        coloraxis: {cmid:0,colorscale:cscale,colorbar: {x: -0.2,orientation:'h'}},
        xaxis: { range: [0, w],fixedrange: true},
        yaxis: { range: [0, h], scaleanchor: "x",fixedrange: true},
        xaxis2: { range: [-50, 50], title: "stress (scaled)",domain:[0.30,0.83],fixedrange: true},
        yaxis2: { range: [0, h], showticklabels:false,fixedrange: true},
        xaxis3: { range: [-0.03, 0.0036], title: "strain",domain:[0.85,1],fixedrange: true},
        yaxis3: { range: [0, h],showticklabels:false,fixedrange: true
        },
        shapes: section_geom.concat(stress_dist_shape,stress_dist_shapeT,stressBar),
        showlegend: false,
        annotations: [{
            text: (Math.round(eps_c_out[k] * 10000) / 10) + "‰",
            font: {
                size: 12,
                color: 'black',
            },
            showarrow: true,
            align: 'center',
            x: eps_c_out[k],
            y: h,
            xref: 'x3',
            yref: 'y3',
        },  {
            xref: 'x2',
            yref: 'y2',
            y: geo.h,
            xanchor: 'left',
            x: -f_yd/1e7,
            yanchor: 'top',
            text: "(&#10132;) <span style='color:rgb(100,55,0)'>" + Math.round(Fct_out[k]) + 'kN</span>' + " +<span style='color:red'> " + Math.round(Fs_out[k]) + 'kN' + "</span> ≈ " + "<span style='color:blue'>" + Math.round(Fc_out[k]) + "kN</span> + " + 
            "<span style='color:green'>" + Math.round(Fsp_out[k]) + "kN</span>",
            showarrow: false,
            bordercolor: '#c7c7c7',
            borderwidth: 2,
            borderpad: 4,
            bgcolor: 'rgba(255,255,255,1)',
            opacity: 0.8
          }],
        margin: {
            l: 50,
            r: 10,
            b: 50,
            t: 50,
            pad: 4
          },
    };

    const ymax = Math.max(...momentHistory) * 1.1;
    const xmax = Math.max(...curvatureHistory) * 1.1;

    var layout3 = {
        margin: {
            l: 50,
            r: 10,
            b: 50,
            t: 10,
            pad: 4
          },
        yaxis: {
            title:"Moment / kNm",
            range: [0, ymax],
            fixedrange: true},
        xaxis: {
            title:"curvature / r<sup> -1</sup>",
            range: [0, xmax],fixedrange: true},
        showlegend: false,
        paper_bgcolor:'rgba(0,0,0,0)',        
    }

    var layout2 = {
        paper_bgcolor:'rgba(0,0,0,0)', 
        xaxis: {domain: [0.15, 0.85],
            range:[-0.005,0.005],
            title:"strain / -",
            fixedrange: true,
        },
        yaxis: {
          title: 'Steel stress / MPa',
          showgrid: false,
          rangemode: 'tozero',
          range: [(-f_yd/1e6)*1.1,(f_yd/1e6)*1.1],
          fixedrange: true,
        },
        yaxis2: {
          title: 'Concrete stress / MPa',
          anchor: 'free',
          overlaying: 'y',
          side: 'right',
          showgrid: false,
          position: 0.85,
          range:[-f_cm*2e-6,f_cm*2e-6],
          showgrid: false,
          fixedrange: true,
          rangemode: 'tozero',
        },
        legend: {
            x: 0.15,
            xanchor: 'left',
            yanchor: 'top',
            y: 1
        },
        margin: {
            l: 10,
            r: 10,
            b: 50,
            t: 10,
            pad: 4
          },
      };





    var data = [trace11, trace12, trace13, trace14,surf[0]]
    var data2 = [trace23, trace24,trace25,trace27,trace28,trace29]
    var data3 = [trace32,trace31]

      
    Plotly.newPlot(ax, data, layout,config);
        ax.layout.yaxis2.range[1] = ax.layout.yaxis.range[1]
        ax.layout.yaxis3.range[1] = ax.layout.yaxis.range[1]
        ax.layout.yaxis2.range[0] = ax.layout.yaxis.range[0]
        ax.layout.yaxis3.range[0] = ax.layout.yaxis.range[0]
        Plotly.redraw(ax)

    Plotly.newPlot(ax2, data2, layout2,config);
    Plotly.newPlot(ax3, data3, layout3,config);
}

window.onresize = () => {

      plotFunc()
      
}

function funco() {
    momentHistory = [];
    curvatureHistory = [];
    plotFunc()
}