var data;
var max;
var avgMax;
var totalsMax;
var scale;
var oScale;
var thisSeason;
var stat = 0;
var stat_before = 0;
var lineYear = 1997;
var currentRoute = 'date-sort';
var format = d3.format("0,000");
var lastIconIndex = -1;
var formatMonthYear = d3.time.format("%B %-d");

var lineGen;
var area;
var careerLine;
var width;
var height;
var x;
var y;
var line_data = [];
var labelMargin = 10;
var yearLabelRight;
var margin = {top: 30, right: 8, bottom: 30, left: 8};
var career = [ 25.1, 5.3, 4.7, 36.3 ];
var statNameArray = [ 'points', 'rebounds', 'assists', 'minutes' ];
var statVerbArray = [ 'scored', 'had', 'had', 'played' ];

var $sort;
var $stat_button = $('.stat_button');
var $dd_li = $('.dropdown-content li');
var $dropbtn = $('.dropbtn');
var $dd_content = $('.dropdown-content');

var teamsDict = {	
			 "CHI":"Chicago Bulls",
			 "ATL":"Atlanta Hawks", 
			 "CLE":"Cleveland Cavaliers", 
			 "DET":"Detroit Pistons", 
			 "CHA":"Charlotte Hornets", 
			 "IND":"Indiana Pacers", 
			 "BOS":"Boston Celtics", 
			 "MIA":"Miami Heat", 
			 "NYK":"New York Knicks", 
			 "ORL":"Orlando Magic", 
			 "TOR":"Toronto Raptors", 
			 "WAS":"Washington Wizards", 
			 "MIL":"Milwaukee Bucks", 
			 "BRK":"Brooklyn Nets", 
			 "PHI":"Philadelphia 76ers", 
			 "GSW":"Golden State Warriors", 
			 "SAS":"San Antonio Spurs", 
			 "DAL":"Dallas Mavericks", 
			 "LAC":"Los Angeles Clippers", 
			 "MEM":"Memphis Grizzlies", 
			 "OKC":"Oklahoma City Thunder", 
			 "UTA":"Utah Jazz", 
			 "DEN":"Denver Nuggets", 
			 "PHO":"Phoenix Suns",
			 "HOU":"Houston Rockets", 
			 "MIN":"Minnesota Timberwolves", 
			 "POR":"Portland Trail Blazers", 
			 "SAC":"Sacramento Kings", 
			 "LAL":"Los Angeles Lakers", 
			 "NOP":"New Orleans Pelicans",
			 "CHA":"Charlotte Hornets/Bobcats",
			 "VAN":"Vancouver Grizzlies",
			 "NOH":"New Orleans Hornets",
			 "NOK":"New Orleans/Oklahoma City Hornets",
			 "SEA":"Seattle SuperSonics",
			 "NJN":"New Jersey Nets"
		}

var tableOffset = 185;

function loadData(){

  var path = "data/KB_MASTER.json";

  d3.json(path, function(error, json) {

    if (error) return console.warn(error);
    data = json;

	renderTemplate( "1997" );
	highlightDropdownSeason($('#1997'));
	formatLineData();
	addEventHandlers();
	initLineChart();
	//have to wait for table-1 to be created before cloning
	setTimeout(function(){ cloneHeader(); }, 1000);

  });

}

function renderTemplate( season ){
	
	$stat_button.eq( stat ).addClass('selected');

	thisSeason = data[ season ];

	$template_holder = $('#template_holder');

	$template_holder.fadeOut('fast', function(){
		$(this).empty();
		var template = $('#template').html(),
	    rendered = Mustache.render(template, thisSeason);
	    $(this).html(rendered);
		$(this).fadeIn('slow');
		$('#footer').fadeIn('slow');

		bindData();
		setTimeout(function(){ sortEvents(); }, 1200);

	});
}

function bindData(){

	d3.selectAll('.container').data(thisSeason.games).enter();
	
	// add dates + playoffs
	d3.selectAll('.container').select('.game_date').html(function(d){
		var date = d.g[ 5 ],
			date_sub = date.substring(0, date.length-3);
		if ( d.g[ 4 ] == 0 ) { return date_sub }
		else { return date_sub + " <span class='playoff_game'>●</span> " }
	});
	// add relevant opp
	d3.selectAll('.container').select('.opp').html(function(d){
		if ( d.g[ 6 ] == 1 ){ return "<span class='at-margin'>@</span>" + d.g[ 7 ] }
		else { return  d.g[ 7 ] }
	});
	// add relevant stat
	d3.selectAll('.container').select('.change').html(function(d){
		return d.g[ stat ]
	});

	d3.selectAll('.season_avg').html(thisSeason.avg[ stat ]);
	d3.selectAll('.career_avg').html(career[ stat ]);
	d3.select('#stat_total').html(format(thisSeason.totals[ stat ]));
	d3.select('#games_played').html(thisSeason.games.length);

	initScales();
	initMarkers();
	initBar();

}

function initBar(){

	d3.selectAll('.container')
		.select('.d1')
		.style('width', function(d){
			return scale(d.g[ stat ]) + '%';
		})
		.style('opacity', function(d){
			return oScale(d.g[ stat ]);
		});
}

function initMarkers(){
	d3.selectAll('.d2').style('width', scale(thisSeason.avg[ stat ]) + '%');
	d3.selectAll('.d3').style('width', scale(career[ stat ]) + '%');
}

function initAbout(){
	$('#about').fadeIn('fast');
}

function closeAbout(){
	$('#about').fadeOut('fast');
}

function initScales(){

 	max = d3.max( thisSeason.games, function(d){ return d.g[ stat ] });
 	if ( max < career[ stat ]) { max = career[ stat ] }
	scale = d3.scale.linear()
           	.domain([0, max])
            .range([0, 96]);
	oScale = d3.scale.linear()
       	.domain([0, max])
        .range([.4, 1]);
}

function toggleData($this, $iconIndex, $thisHTML) {

	var keys = Object.keys(data);
	var count = 0;

	if ($iconIndex === 0) {

			keys.forEach(function(season){
			  data[season].games.forEach(function(game){
			    var splitDate = game.g[5].split('/',2)
			    var date = splitDate[0] + '/' + splitDate[1];
			    if ( date === $thisHTML){ 
			    	count = count + 1; 
			    }
			  })
			})
		
		$this.closest('.container').next().find('.toggle-text').html('<i class="fa fa-close toggle-text-close"></i> KB played a total of ' + count + ' games on ' + formatMonthYear(new Date($thisHTML)) + ' throughout his career.')

	}

	if ($iconIndex === 1) {

			var teamConverted;

			if (teamsDict.hasOwnProperty($thisHTML)){ 

				teamConverted = teamsDict[$thisHTML];

			} else {

				teamsConverted = $thisHTML;

			}

			keys.forEach(function(season){
			  data[season].games.forEach(function(game){
			    var opp = game.g[7]
			    if ( opp === $thisHTML){ 
			    	count = count + 1; 
			    }
			  })
			})
		
		$this.closest('.container').next().find('.toggle-text').html('<i class="fa fa-close toggle-text-close"></i> KB played ' + count + ' games against the ' + teamConverted + ' during his career.')

	}

	if ($iconIndex === 2) {
			keys.forEach(function(season){
			  data[season].games.forEach(function(game){
			    var thisStat = game.g[stat]
			    if ( thisStat == $thisHTML){ 
			    	count = count + 1; 
			    }
			  })
			}) 
		
		$this.closest('.container').next().find('.toggle-text').html('<i class="fa fa-close toggle-text-close"></i> KB ' + statVerbArray[stat] + ' a total of ' + $thisHTML + ' ' + statNameArray[stat] + ' ' +  count + ' different times during his career.')

	}

}

function toggleIcon($this, $iconIndex) {

	if ($this.closest('.container').next().is(':visible') && $iconIndex === lastIconIndex) {
		$this.closest('.container').next().toggle();
		$('td.toggle-data').removeClass('td-selected');
	} 
	else if ($this.closest('.container').next().is(':visible') && $iconIndex !== lastIconIndex) {
		$('td.toggle-data').removeClass('td-selected');
		$this.addClass('td-selected');
	}
	else {
		$('tr.toggle-row').hide();
		$('td.toggle-data').removeClass('td-selected');
		$this.closest('.container').next().toggle();
		$this.addClass('td-selected')
	}

	lastIconIndex = $iconIndex;

}

function addEventHandlers(){

	$(document).on('click', '.toggle-data', function(){
    	var $this = $(this);
    	var $iconIndex = $this.index();
    	var $thisHTML;
    	if ($iconIndex == 1){
    		var $tempHTML = $this.html();
    		$thisHTML = $tempHTML.slice(-3);
    	} else {
    		$thisHTML = $this.html();
    	}
    	toggleIcon($this, $iconIndex);
    	toggleData($this, $iconIndex, $thisHTML);
    })

	$(document).on('click', '.toggle-text-close', function(){
		
		$(this).closest('.toggle-row').hide();
		$('td.toggle-data').removeClass('td-selected');
	})
	
	$('#title').on('click', function(event){
		event.stopPropagation();
		initAbout();
	})

	$('#about').on('click', function(event){
		event.stopPropagation();
		closeAbout();	
	})

    $stat_button.on('click', function(){

       	stat = $(this).index();

       	$(this).addClass('selected').siblings().removeClass('selected');

       	if ( stat !== stat_before ) {

	        initScales();
	        transition();
	        lineTransition();

    	}

        if ( currentRoute === 'stat-sort' ) {
        	var $stat = $('.stat-sort');
			$stat.find('.fa').css('color', '#eee');
			$stat.find('.fa').removeClass('fa-angle-down');
			$stat.find('.fa').addClass('fa-angle-up');
		}

		stat_before = stat;

    });

    $('.fa-angle-left').on('click', function(){
    	var textRaw = $dropbtn.html();
    	var thisYear = textRaw.substring(0, 4);
    	var thisYearAdj = parseInt(thisYear);
    	if ( thisYearAdj === 1996 ) {
    		thisYearAdj = 2016;
    	}
    	var $targetYear = $('#' + thisYearAdj );
    	highlightDropdownSeason($targetYear);
    	var subYear = $targetYear.text();
    	var regEx = subYear.replace(/[^\x00-\x7F]/g, "");
    	$dropbtn.html( regEx );
    	renderTemplate( thisYearAdj );
    	lineYear = thisYearAdj;
    	moveSeasonCircle();
    	// redo cloned header
    	$('#header-fixed').empty();
    	cloneHeader();
    })

    $('.fa-angle-right').on('click', function(){
    	var textRaw = $dropbtn.html();
    	var thisYear = textRaw.substring(0, 4);
    	var thisYearAdj = parseInt(thisYear) + 2;
    	if ( thisYearAdj === 2017 ) {
    		thisYearAdj = 1997;
    	}
    	var $targetYear = $('#' + thisYearAdj );
    	highlightDropdownSeason($targetYear);
    	var addYear = $targetYear.text();
    	var regEx = addYear.replace(/[^\x00-\x7F]/g, "");
    	$dropbtn.html( regEx );
    	renderTemplate( thisYearAdj );
    	lineYear = thisYearAdj;
    	moveSeasonCircle();
    	// redo cloned header
    	$('#header-fixed').empty();
    	cloneHeader();
    })

    $dropbtn.on('click', function(){

	    $('.dropdown-content').addClass('visible');
	    $('.dropdown-content ul').slideToggle('fast', function(){
	        if(!$(this).is(':visible')){
	            $('.dropdown-content').removeClass('visible');
	        }
	    });

    })

    $dd_li.on('click', function(){
    	var $this = $(this);
    	var $thisVal = $this.attr('id');
        renderTemplate( $thisVal );
        highlightDropdownSeason($this);
        lineYear = $thisVal;
        var $thisText = $this.text();
        var $thisTextFiltered = $thisText.replace(/[^\x00-\x7F]/g, "");
    	$dropbtn.html( $thisTextFiltered );
    	moveSeasonCircle();
    	// redo cloned header
    	$('#header-fixed').empty();
    	cloneHeader();
    })

    $(document).on('click', function(e) {
	  if(!$(e.target).is('.dropbtn')) {
	    $('.dropdown-content ul').hide();
	    $('.dropdown-content').removeClass('visible');
	  }
	});
}

function sortEvents(){

	$sort = $('.sort');

	$sort.on('click', function(){
		var $this = $(this).attr('class');
		// grab first class
		var thisClass = $this.split(' ')[0];
		$sort.find('.fa').css('color','#eee');
		$('.' + thisClass).find('.fa').css('color','indianred')
		toggleSortArrows( thisClass );

	})
}

function transition(){

	$('.toggle-row').hide();
	$('.toggle-data').removeClass('td-selected');

	// update legend stats and sub totals
	d3.selectAll('.season_avg').style('opacity', 0).html(thisSeason.avg[ stat ]).transition().duration(500)
	.style('opacity', 1);
	d3.selectAll('.career_avg').style('opacity', 0).html(career[ stat ]).transition().duration(500)
	.style('opacity', 1);
	d3.select('#stat_total').html(format(thisSeason.totals[ stat ]));

	d3.selectAll('.container').select('.change').style('opacity', 0).html(function(d){
		return d.g[ stat ]
	}).transition().duration(500).style('opacity', 1);
	// d1
	d3.selectAll('.container').select('.d1').transition().duration(1000).styleTween('width', function(d, i, a){
		return d3.interpolateString(this.style.width, scale(d.g[ stat ]) + "%")
	})
	.style('opacity', function(d){
		return oScale(d.g[ stat ])
	});
	// d2 - season avg
	d3.selectAll('.d2').transition().duration(1000).styleTween('width', function(d, i, a){
		return d3.interpolateString(this.style.width, scale(thisSeason.avg[ stat ]) + "%")
	});
	// d3 - career avg
	d3.selectAll('.d3').transition().duration(1000).styleTween('width', function(d, i, a){
		return d3.interpolateString(this.style.width, scale(career[ stat ]) + "%")
	});
}

function formatLineData() {
	var keys = _.keys(data);
	for (seasons in keys){
		line_data.push({
		    year: keys[seasons],
		    avg: data[keys[seasons]].avg,
		    totals: data[keys[seasons]].totals
		});
	}
}

function sortData( route ){

	currentRoute = route;

	if ( route === 'date-sort'){
		thisSeason.games.sort(function(a,b){
			return a.g[ 8 ] - b.g[ 8 ];
		})
	}

	if ( route === 'opp-sort'){
		thisSeason.games.sort(function(a,b){
			return d3.ascending(a.g[ 7 ], b.g[ 7 ]) || a.g[ 8 ] - b.g[ 8 ];
		})
	}

	if ( route === 'stat-sort'){
		thisSeason.games.sort(function(a,b){
			return b.g[ stat ] - a.g[ stat ] || a.g[ 8 ] - b.g[ 8 ];
		})	
	}

	updateForSort();

}

function updateForSort(){

	$('.toggle-row').hide();
	$('.toggle-data').removeClass('td-selected');

	var container = d3.selectAll('.container').data(thisSeason.games);
	container.exit().remove();
	container.enter();
	// bar
	d3.selectAll('.container').select('.d1')
		.style('opacity', 0)
		.style('width', function(d){
			return scale(d.g[ stat ]) + "%";
		})
		.transition()
		.duration( 1000 )
		.style('opacity', function(d){
			return oScale(d.g[ stat ]);
		});

	// stat
	d3.selectAll('.container').select('.change')
		.style('opacity', 0)
		.html(function(d){
			return d.g[ stat ];
		})
		.transition()
		.duration( 1000 )
		.style('opacity', 1);
	// date
	d3.selectAll('.container').select('.game_date')
		.style('opacity', 0)
		.html(function(d){
			var date = d.g[ 5 ],
				date_sub = date.substring(0, date.length-3);
			if ( d.g[ 4 ] == 0 ) { return date_sub }
			else { return date_sub + " <span class='playoff_game'>●</span> " }
		})
		.transition()
		.duration( 1000 )
		.style('opacity', 1);
	// opp
	d3.selectAll('.container').select('.opp')
		.style('opacity', 0)
		.html(function(d){
			if ( d.g[ 6 ] == 1 ){ return "<span class='at-margin'>@</span>" + d.g[ 7 ] }
			else { return d.g[ 7 ] }
		})
		.transition()
		.duration( 1000 )
		.style('opacity', 1);

}

function initLineChart() {

	avgMax = d3.max( line_data, function(d){ return d.avg[ stat ] });
	totalsMax = d3.max( line_data, function(d){ return d.totals[ stat ] });

	width = parseInt(d3.select('#line_chart').style('width'), 10);
	height = parseInt(d3.select('#line_chart').style('height'), 10) / 2;

	var svg = d3.select('#line_chart').append('svg')
		.attr('width', width)
		.attr('height', height * 2)
		.style('background', '#1c1c1c');
		// .style('display', 'none');

		x = d3.time.scale().range([margin.left, width - margin.right]).domain([1997, 2016]),
		y = d3.scale.linear().range([height, margin.top]).domain([0, avgMax]),
		y2 = d3.scale.linear().range([height, height * 2 - margin.bottom]).domain([0, totalsMax]);

    lineGenAvg = d3.svg.line()
        .x(function( d ) {return x( d.year ); })
        .y(function( d ) {return y( d.avg[ stat ] ); })
        .interpolate("cardinal");

    lineGenTotals = d3.svg.line()
        .x(function( d ) {return x( d.year ); })
        .y(function( d ) {return y2( d.totals[ stat ] ); })
        .interpolate("cardinal");

    areaAvg = d3.svg.area()
        .x(function(d) { return x( d.year ); })
        .y0(height)
        .y1(function(d) {return y( d.avg[ stat ] ); })
        .interpolate("cardinal");

    areaTotals = d3.svg.area()
        .x(function(d) { return x( d.year ); })
        .y0(height)
        .y1(function(d) {return y2( d.totals[ stat ] ); })
        .interpolate("cardinal");

   svg.append('path')
	    .datum(line_data)
	    .attr('class', 'area-avg')
	    .attr('fill', '#3090c7')
	    .attr('opacity', 0.75)
	    .attr('shape-rendering', 'geometricPrecision')
	    .attr('d', areaAvg);

   svg.append('path')
	    .datum(line_data)
	    .attr('class', 'area-totals')
	    .attr('fill', '#eee')
	    .attr('opacity', 0.75)
	    .attr('shape-rendering', 'geometricPrecision')
	    .attr('d', areaTotals);

    svg.append('svg:path')
        .attr('d', lineGenAvg( line_data ))
        .attr('class', 'line-avg')
        .attr('stroke', '#3090c7')
        .attr('stroke-width', 2)
        .attr('opacity', 1)
        .attr('shape-rendering', 'geometricPrecision')
        .attr('fill', 'none');

    svg.append('svg:path')
        .attr('d', lineGenTotals( line_data ))
        .attr('class', 'line-totals')
        .attr('stroke', '#eee')
        .attr('stroke-width', 2)
        .attr('opacity', 1)
        .attr('shape-rendering', 'geometricPrecision')
        .attr('fill', 'none');

    // career avg
    marker_connector = svg.append("svg:line")
    	.attr("class", "career-avg")
	    .attr("x1", margin.left )
	   	.attr("y1", y(career[stat]) )
	    .attr("x2", width - margin.right )
	    .attr("y2", y(career[stat]) )
	    .style("stroke-width", ("2"))
	    .style("stroke-dasharray", ("6, 4"))
	    .style("opacity", 1)
	    .style("stroke", "#ffb400");

    // connector
    marker_connector = svg.append("svg:line")
    	.attr("class", "marker-connector")
	    .attr("x1", x( 2016 ) )
	   	.attr("y1", margin.top - margin.top / 2 )
	    .attr("x2", x( 2016 ) )
	    .attr("y2", height * 2 - margin.bottom + margin.bottom / 2 )
	    .style("stroke-width", ("2"))
	    .style("opacity", 1)
	    .style("stroke", "rgba(255,255,255,1)");

   	// label circles
   	// TOP
    svg.append('circle')
    	.attr("class", "label-circles")
    	.attr("cx", x( 2016 ) )
    	.attr("cy", margin.top - margin.top / 2 )
    	.attr('r', 6)
    	.attr("fill", "#eee")
    svg.append('circle')
    	.attr("class", "label-circles")
      	.attr("cx", x( 2016 ) )
    	.attr("cy", margin.top - margin.top / 2 )
    	.attr('r', 4)
    	.attr("fill", "#3090c7")

    //text
    // TOP
    svg.append('text')
    	.attr("class", "text season-avg labels")
    	.attr("x", function(){
	   		if (lineYear > 2006){
	   			return x(lineYear) - labelMargin
	   		} else {
	   			return x(lineYear) + labelMargin
	   		}
	   	})
    	.attr("y", margin.top - 14 )
	   	.attr("text-anchor", function(){
	   		if (lineYear > 2006){
	   			return "end"
	   		} else {
	   			return "start"
	   		}
	   	})
    	.attr("fill", "#eee")
    	.attr("font-size", "0.85em")
    	.style('opacity', 0)
    	.text("Season Avg: " + thisSeason.avg[ stat ]);

   	// label circles
   	// TOP
    svg.append('circle')
    	.attr("class", "label-circles")
    	.attr("cx", x( 2016 ) )
    	.attr("cy", height * 2 - margin.bottom + margin.bottom / 2 )
    	.attr('r', 6)
    	.attr("fill", "#eee")
    svg.append('circle')
    	.attr("class", "label-circles")
      	.attr("cx", x( 2016 ) )
    	.attr("cy", height * 2 - margin.bottom + margin.bottom / 2 )
    	.attr('r', 4)
    	.attr("fill", "#eee")

   // text
   // bottom
    svg.append('text')
    	.attr("class", "text season-total labels")
    	.attr("x", function(){
	   		if (lineYear > 2006){
	   			return x(lineYear) - labelMargin
	   		} else {
	   			return x(lineYear) + labelMargin
	   		}
	   	})
    	.attr("y", height * 2 - margin.bottom + 16 )
	   	.attr("text-anchor", function(){
	   		if (lineYear > 2006){
	   			return "end"
	   		} else {
	   			return "start"
	   		}
	   	})
    	.attr("fill", "#eee")
    	.attr("font-size", "0.85em")
    	.style('opacity', 0)
    	.text("Season Total: " + format(thisSeason.totals[ stat ]));

    // intro slide
    d3.selectAll('.label-circles')
    	.transition()
    	.duration(1200)
    	.attr("cx", x(lineYear));

    d3.selectAll('.marker-connector')
    	.transition()
    	.duration(1200)
    	.attr("x1", x(lineYear))
		.attr("x2", x(lineYear));

	d3.selectAll('.labels')
		.transition()
		.delay(900)
		.duration(500)
		.style('opacity', 1)

	}

function resize() {

	// update width
	width = parseInt(d3.select('#line_chart').style('width'), 10);

	// reset x range
	x = d3.time.scale().range([margin.left, width - margin.right]).domain([1997, 2016]);
	y = d3.scale.linear().range([height, margin.top]).domain([0, avgMax]),
	y2 = d3.scale.linear().range([height, height * 2 - margin.bottom]).domain([0, totalsMax]);

	d3.select('svg').attr('width', width);

    areaAvg = d3.svg.area()
        .x(function(d) { return x( d.year ); })
        .y0(height)
        .y1(function(d) {return y( d.avg[ stat ] ); })
        .interpolate("cardinal");

    areaTotals = d3.svg.area()
        .x(function(d) { return x( d.year ); })
        .y0(height)
        .y1(function(d) {return y2( d.totals[ stat ] ); })
        .interpolate("cardinal");

	lineGenAvg = d3.svg.line()
        .x(function( d ) {return x( d.year ); })
        .y(function( d ) {return y( d.avg[ stat ] ); })
        .interpolate("cardinal");

	lineGenTotals = d3.svg.line()
        .x(function( d ) {return x( d.year ); })
        .y(function( d ) {return y2( d.totals[ stat ] ); })
        .interpolate("cardinal");

    d3.selectAll(".avg_marker")
    	.attr("transform", "translate(" + x( lineYear ) + ',' + y( thisSeason.avg[ stat ] ) + ")");

   	d3.selectAll(".totals_marker")
    	.attr("transform", "translate(" + x( lineYear ) + ',' + y2( thisSeason.totals[ stat ] ) + ")");

    // connector
    d3.select("line.marker-connector")
	    .attr("x1", x(lineYear ) )
	    .attr("x2", x(lineYear ) );

    // connector
    d3.select("line.career-avg")
	    .attr("x1", margin.left )
	    .attr("x2", width - margin.right );

	d3.select("line.middle-line")
	    .attr("x1", margin.left)
	    .attr("x2", width + margin.right);

    d3.selectAll(".career_marker").attr("x2", width + margin.right);

    d3.select('path.line-avg')
    	.attr('d', lineGenAvg( line_data ))

    d3.select('path.line-totals')
    	.attr('d', lineGenTotals( line_data ))

    d3.select('path.area-avg')
	    .datum(line_data)
	    .attr('d', areaAvg);

    d3.select('path.area-totals')
	    .datum(line_data)
	    .attr('d', areaTotals);

	d3.selectAll(".label-circles")
		.attr("cx", x( lineYear ));

	d3.selectAll("text.labels")
    	.attr("x", function(){
	   		if (lineYear > 2006){
	   			return x(lineYear) - labelMargin
	   		} else {
	   			return x(lineYear) + labelMargin
	   		}
	   	})

}

function lineTransition() {

	// update width
	width = parseInt(d3.select('#line_chart').style('width'), 10);

	avgMax = d3.max( line_data, function(d){ return d.avg[ stat ] });
	totalsMax = d3.max( line_data, function(d){ return d.totals[ stat ] });

	// reset x range
	x = d3.time.scale().range([margin.left, width - margin.right]).domain([1997, 2016]);
	y = d3.scale.linear().range([height, margin.top]).domain([0, avgMax]),
	y2 = d3.scale.linear().range([height, height * 2 - margin.bottom]).domain([0, totalsMax]);

	d3.select('svg').attr('width', width);
	d3.select('text.season-avg').text('Season Avg: ' + thisSeason.avg[stat]);
	d3.select('text.season-total').text('Season Total: ' + format(thisSeason.totals[stat]));

	areaAvg = d3.svg.area()
        .x(function(d) { return x( d.year ); })
        .y0(height)
        .y1(function(d) {return y( d.avg[ stat ] ); })
        .interpolate("cardinal");

	lineGenAvg = d3.svg.line()
        .x(function( d ) {return x( d.year ); })
        .y(function( d ) {return y( d.avg[ stat ] ); })
        .interpolate("cardinal");

	areaTotals = d3.svg.area()
        .x(function(d) { return x( d.year ); })
        .y0(height)
        .y1(function(d) {return y2( d.totals[ stat ] ); })
        .interpolate("cardinal");

	lineGenTotals = d3.svg.line()
        .x(function( d ) {return x( d.year ); })
        .y(function( d ) {return y2( d.totals[ stat ] ); })
        .interpolate("cardinal");

    d3.selectAll(".avg_marker")
    	.transition().duration(1000)
    	.attr("transform", "translate(" + x( lineYear ) + ',' + y( thisSeason.avg[ stat ] ) + ")");

   	d3.selectAll(".totals_marker")
    	.transition().duration(1000)
    	.attr("transform", "translate(" + x( lineYear ) + ',' + y2( thisSeason.totals[ stat ] ) + ")");

    // connector
    d3.select("line.career-avg")
    	.transition().duration(1000)
	    .attr("y1", y(career[stat]))
	    .attr("y2", y(career[stat]));

    d3.select('path.line-avg')
    	.transition().duration(1000)
    	.attr('d', lineGenAvg( line_data ))

   d3.select('path.area-avg')
	    .datum(line_data)
	    .transition().duration(1000)
	    .attr('d', areaAvg);

    d3.select('path.line-totals')
    	.transition().duration(1000)
    	.attr('d', lineGenTotals( line_data ))

   d3.select('path.area-totals')
	    .datum(line_data)
	    .transition().duration(1000)
	    .attr('d', areaTotals);

}

function moveSeasonCircle(){

	x = d3.time.scale().range([margin.left, width - margin.right]).domain([1997, 2016]);
	y = d3.scale.linear().range([height, margin.top]).domain([0, avgMax]),
	y2 = d3.scale.linear().range([height, height * 2 - margin.bottom]).domain([0, totalsMax]);

	d3.selectAll(".avg_marker").style("opacity", 0)
	    .attr("transform", "translate(" + x( lineYear ) + ',' + y( thisSeason.avg[ stat ] ) + ")")
	 	.transition().duration(1000)
	 	.style("opacity", 1);

	d3.selectAll(".totals_marker").style("opacity", 0)
	    .attr("transform", "translate(" + x( lineYear ) + ',' + y2( thisSeason.totals[ stat ] ) + ")")
	 	.transition().duration(1000)
	 	.style("opacity", 1);

	d3.selectAll(".label-circles")//.style("opacity", 0)
		 	.transition().duration(1000)
		.attr("cx", x( lineYear ))
	 	.style("opacity", 1);

	d3.select("line.marker-connector")
		.transition().duration(1000)
	   	.attr("x1", x(lineYear ) )
	   	.attr("y1", margin.top - margin.top / 2 )
	    .attr("x2", x(lineYear ) )
		.attr("y2", height * 2 - margin.bottom + margin.bottom / 2 )
	 	
	 	//.style("opacity", 1);

	d3.select("text.season-avg").style("opacity", 0)
    	.attr("x", function(){
	   		if (lineYear > 2006){
	   			return x(lineYear) - labelMargin
	   		} else {
	   			return x(lineYear) + labelMargin
	   		}
	   	})
	   	.attr("text-anchor", function(){
	   		if (lineYear > 2006){
	   			return "end"
	   		} else {
	   			return "start"
	   		}
	   	})
	   	.transition().duration(1200)
	 	.style("opacity", 1)
	 	.text("Season Avg: " + format(thisSeason.avg[ stat ]));

	d3.select("text.season-total").style("opacity", 0)
    	.attr("x", function(){
	   		if (lineYear > 2006){
	   			return x(lineYear) - labelMargin
	   		} else {
	   			return x(lineYear) + labelMargin
	   		}
	   	})
	   	.attr("text-anchor", function(){
	   		if (lineYear > 2006){
	   			return "end"
	   		} else {
	   			return "start"
	   		}
	   	})
	   	.transition().duration(1200)
	 	.style("opacity", 1)
	 	.text("Season Total: " + format(thisSeason.totals[ stat ]));
}

$(window).resize(function(){
	resize(); 
});

function toggleSortArrows( _this ) {

	var thisSelect = $('.' + _this);
	var thisFA = thisSelect.find('.fa');
	var thisSiblings = thisSelect.siblings().find('.fa');

	if ( ! thisFA.hasClass('fa-angle-down') ) {

		thisSiblings.removeClass('fa-angle-down');
		thisSiblings.addClass('fa-angle-up');
		thisFA.removeClass('fa-angle-up'); 
		thisFA.addClass('fa-angle-down'); 	
		// get first class!
		sortData( _this );
	}
}

function highlightDropdownSeason( thisSeason ){
	thisSeason.siblings().removeClass('selected');
	thisSeason.addClass('selected');
}

function cloneHeader(){

	var $header = $("#table-1 > thead").clone();
	var $fixedHeader = $("#header-fixed").append($header);
	

	//$( window ).on('scroll', function(){
	setInterval(function(){

		var offset = $(window).scrollTop();

	    if (offset >= tableOffset && $fixedHeader.is(":hidden")) {
	        $fixedHeader.show();
	    }
	    else if (offset < tableOffset) {
	        $fixedHeader.hide();
	    }
	}, 100);
}

$( document ).ready(function() {

	loadData();

});
