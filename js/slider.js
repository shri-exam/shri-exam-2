var slider = {

    loadOnStart: 20,
    container: $('.b-slider'),
    dWidth: $(document).width(),
    thumbsBgWrap: $('.b-thumbs__bg'),
    imgid: 0,
    apiUrl: 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/created/?format=json&callback=?',

    init: function() {
        slider.setImgId();
        slider.getData();
        slider.binds();
    },

    setImgId: function(){
        slider.imgid = history.location.search || 0;
    },

    image: function(src, alt, cls){
        return $('<img />', {
            'alt': alt,
            'src': src,
            'class': cls
        });
    },

    sliderItem: function (link, alt){
        alt = alt || 'alt';
        return $('<li />',{
            class: 'b-slider__item',
            css: ({
                width: slider.dWidth
            })
        }).append(slider.image(link, alt, 'b-slider__img'));
    },

    getData: function(){
        $.getJSON(slider.apiUrl, function (data) {
            slider.imagesData = data.entries;

            slider.takeFirstImage();
            slider.imagesPreload(0, slider.loadOnStart);
            $('.b-thumbs__item').first().addClass('b-thumbs__item-selected');
        });
    },

    imagesPreload: function(from, to) {
        var lastPreloaded = $('.b-thumbs__item').last().index() + 1;
        from = from || lastPreloaded;
        to = to || from + 5 ;
        for (var i = from; i < to; i++){
            if (slider.imagesData[i]) {
                var thumbImgLink = slider.imagesData[i].img.XXS.href,
                    thumbImgTitle = slider.imagesData[i].title,
                    bigImage = slider.imagesData[i].img.L.href,
                    thumbsWrap = $('.b-thumbs'),
                    thumbsItem = $('<li class="b-thumbs__item"/>'),
                    thumbsImg = slider.image(thumbImgLink, thumbImgTitle, 'b-thumbs__img');

                $('<img/>')[0].src = bigImage; // preload full images to cache

                thumbsItem.data("info", { number: i, src: bigImage, alt: thumbImgTitle }).click(function () {slider.changeImg('thumb', $(this));}).append(thumbsImg).appendTo(thumbsWrap);
            }
        }
    },

    takeFirstImage: function() {
        var link = slider.imagesData[slider.imgid].img.L.href,
            alt = slider.imagesData[slider.imgid].title;

        slider.sliderItem(link, alt).appendTo(slider.container);
    },

    changeImg: function(direction, thumb) {

        var selectedThumb = $('.b-thumbs__item-selected'),
            imageLink,
            imageAlt,
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

                thumb.addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');

                slider.container.append(slider.sliderItem(imageLink, imageAlt)).animate({left: "-="+slider.dWidth+"px"}, 500, function () {
                    slider.container.css('left', 0).children().first().remove();
                });
            }else if (!thumb && !selectedThumb.is(':last-child')){
                imageLink = selectedThumb.next().data('info').src;
                imageAlt = selectedThumb.next().data('info').alt;

                selectedThumb.removeClass('b-thumbs__item-selected').next().addClass('b-thumbs__item-selected');

                slider.container.append(slider.sliderItem(imageLink, imageAlt)).animate({left: "-="+slider.dWidth+"px"}, 500, function () {
                    slider.container.css('left', 0).children().first().remove();
                });
            }

        }else if (direction == 'prev'){
            if (thumb && !thumb.hasClass('b-thumbs__item-selected')){
                imageLink = thumb.data('info').src;
                imageAlt = thumb.data('info').alt;

                thumb.addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');

                slider.container.css('left', -slider.dWidth).prepend(slider.sliderItem(imageLink, imageAlt)).animate({left:"+="+slider.dWidth+"px"}, 500, function () {
                    slider.container.css('left', 0).children().last().remove();
                });
            }else if(!thumb && !selectedThumb.is(':first-child')) {
                imageLink = selectedThumb.prev().data('info').src;
                imageAlt = selectedThumb.prev().data('info').alt;

                selectedThumb.removeClass('b-thumbs__item-selected').prev().addClass('b-thumbs__item-selected');

                slider.container.css('left', -slider.dWidth).prepend(slider.sliderItem(imageLink, imageAlt)).animate({left:"+="+slider.dWidth+"px"}, 500, function () {
                    slider.container.css('left', 0).children().last().remove();
                });
            }

        }

        slider.thumbCentring();
        slider.imagesPreload();
        history.pushState( null, null, '?imgid='+slider.imgid );
    },

    calcWidth: function() {
        slider.dWidth = $(document).width();
        $('.b-slider__item').css('width', slider.dWidth);
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
            slider.imagesPreload();
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