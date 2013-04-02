var slider = {

    imgid: 0,
    loadOnStart: 20,
    container: $('.b-slider'),
    dWidth: $(document).width(),
    thumbsBgWrap: $('.b-thumbs__bg'),
    apiUrl: 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/created/?format=json&callback=?',

    init: function() {
        var urlData = history.location.search;
        if(urlData != ""){
            slider.imgid = parseFloat(urlData.replace('?imgid=', ''));
            if(slider.imgid > slider.loadOnStart){
                slider.loadOnStart = slider.loadOnStart + slider.imgid;
            }
        }

        slider.getData();
        slider.binds();
    },

    getData: function(){
        $.getJSON(slider.apiUrl, function (data) {
            slider.imagesData = data.entries;

            slider.takeFirstImage();
            slider.imagesLoad(0, slider.loadOnStart);
            slider.thumbCentring();
        });
    },

    takeFirstImage: function() {
        var link = slider.imagesData[slider.imgid].img.L.href,
            alt = slider.imagesData[slider.imgid].title;

        slider.createItem(link, alt, 'b-slider__item', 'b-slider__img').appendTo(slider.container);
    },

    createItem: function (link, alt, itemCls, imgCls){
        alt = alt || 'alt';
        var itemWidth;
        if(itemCls === 'b-slider__item') {
            itemWidth = slider.dWidth;
        }
        return $('<li />',{
            class: itemCls,
            css: ({
                width: itemWidth
            })
        }).append(slider.image(link, alt, imgCls));
    },

    image: function(src, alt, cls){
        return $('<img />', {
            'alt': alt,
            'src': src,
            'class': cls
        });
    },

    imagesLoad: function(from, to) {
        var lastPreloaded = $('.b-thumbs__item').last().index() + 1;
        from = from || lastPreloaded;
        to = to || from + 5 ;
        for (var i = from; i < to; i++){
            if (slider.imagesData[i]) {
                var thumbImgLink = slider.imagesData[i].img.XXS.href,
                    thumbImgTitle = slider.imagesData[i].title,
                    bigImage = slider.imagesData[i].img.L.href,
                    thumbsWrap = $('.b-thumbs'),
                    thumbsItemCls = (i === slider.imgid)? 'b-thumbs__item b-thumbs__item-selected' : 'b-thumbs__item',
                    thumbsItem = slider.createItem(thumbImgLink, thumbImgTitle, thumbsItemCls, 'b-thumbs__img');

                $('<img/>')[0].src = bigImage; // load full images to cache

                thumbsWrap.append(thumbsItem.data("info", { number: i, src: bigImage, alt: thumbImgTitle }).click(function () {slider.changeImg('thumb', $(this));}));
            }
        }
    },

    changeImg: function(direction, thumb) {

        var selectedThumb = $('.b-thumbs__item-selected'),
            imageLink,
            imageAlt,
            imageNumber,
            getDirection = function (thumb){
                if(selectedThumb.index() < thumb.index()){
                    return 'next';
                }else{ return 'prev';}
            };

        thumb = thumb || undefined;
        direction = ( direction === 'thumb') ? getDirection(thumb) : direction;


        if (direction == 'next'){
            if (thumb && !thumb.hasClass('b-thumbs__item-selected')){
                imageLink = thumb.data('info').src;
                imageAlt = thumb.data('info').alt;
                imageNumber = thumb.data('info').number;

                thumb.addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');

                slider.sliderNext(imageLink, imageAlt, imageNumber);

            }else if (!thumb && !selectedThumb.is(':last-child')){
                imageLink = selectedThumb.next().data('info').src;
                imageAlt = selectedThumb.next().data('info').alt;
                imageNumber = selectedThumb.next().data('info').number;

                selectedThumb.removeClass('b-thumbs__item-selected').next().addClass('b-thumbs__item-selected');

                slider.sliderNext(imageLink, imageAlt, imageNumber);

            }

        }else if (direction == 'prev'){
            if (thumb && !thumb.hasClass('b-thumbs__item-selected')){
                imageLink = thumb.data('info').src;
                imageAlt = thumb.data('info').alt;
                imageNumber = thumb.data('info').number;

                thumb.addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');

                slider.sliderPrev(imageLink, imageAlt, imageNumber);

            }else if(!thumb && !selectedThumb.is(':first-child')) {
                imageLink = selectedThumb.prev().data('info').src;
                imageAlt = selectedThumb.prev().data('info').alt;
                imageNumber = selectedThumb.prev().data('info').number;

                selectedThumb.removeClass('b-thumbs__item-selected').prev().addClass('b-thumbs__item-selected');

                slider.sliderPrev(imageLink, imageAlt, imageNumber);

            }

        }

    },

    sliderNext: function(link, alt, id){
        slider.container.append(slider.createItem(link, alt, 'b-slider__item', 'b-slider__img')).animate({left: "-="+slider.dWidth+"px"}, 500, function () {
            slider.container.css('left', 0).children().first().remove();
        });

        slider.imagesLoad();
        slider.updateUrl(id);
        slider.thumbCentring();
    },

    sliderPrev: function(link, alt, id){
        slider.container.css('left', -slider.dWidth).prepend(slider.createItem(link, alt, 'b-slider__item', 'b-slider__img')).animate({left:"+="+slider.dWidth+"px"}, 500, function () {
            slider.container.css('left', 0).children().last().remove();
        });

        slider.imagesLoad();
        slider.updateUrl(id);
        slider.thumbCentring();
    },

    calcWidth: function() {
        slider.dWidth = $(document).width();
        $('.b-slider__item').css('width', slider.dWidth);
    },

    updateUrl: function(id) {
        if(id) { history.pushState( null, null, '?imgid='+id); }

    },

    thumbCentring: function(){
        var selectedLeft = $('.b-thumbs__item-selected').position().left;
        if( selectedLeft > (slider.dWidth / 2) ){
            var calculated = selectedLeft - ((slider.dWidth - 190) / 2);

            slider.thumbsBgWrap.animate({
                scrollLeft: calculated
            }, 500);
        }else {
            slider.thumbsBgWrap.animate({
                scrollLeft: 0
            }, 500);
        }
    },

    binds: function() {

        slider.thumbsBgWrap.mousewheel(function(event, delta) {
            var val = this.scrollLeft - (delta * 30);
            $(this).scrollLeft(val);
            slider.imagesLoad();
        });

        $('.b-thumbs__wrap').hover(function() {
            slider.thumbsBgWrap.toggleClass('b-thumbs__bg--up');
        });

        $(window).resize(function () {
            slider.calcWidth();
            slider.thumbCentring();
        });
    }

};

$(window).load(function () {
    slider.init();
});