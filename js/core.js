var jsonData,
    imagesData,
    dWidth = $(document).width(),
    slider = $('.b-slider'),
    image = function (src, alt, cls) {
        return $('<img />', {
            'alt': alt,
            'src': src,
            'class': cls
        });
    };

function getData() {
    var apiUrl = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/created/?format=json&callback=?';
    $.getJSON(apiUrl, function (data) {
        jsonData = data;
        imagesData = jsonData.entries;
        takeFirstImage();
        imagesPreload(0, 20);
        $('.b-thumbs__item').first().addClass('b-thumbs__item-selected');
    });
}

function createThumb(i) {
    var thumbImgLink = imagesData[i].img.XXS.href,
        thumbImgTitle = imagesData[i].title,
        bigImage = imagesData[i].img.L.href,
        thumbsWrap = $('.b-thumbs'),
        thumbsItem = $('<li class="b-thumbs__item"/>'),
        thumbsImg = image(thumbImgLink, thumbImgTitle, 'b-thumbs__img');

    $('<img/>')[0].src = bigImage;
    thumbsItem.append(thumbsImg).appendTo(thumbsWrap).data("info", { number: i, src: bigImage, alt: thumbImgTitle });
}

function imagesPreload(from, to) {
    var lastPreloaded = $('.b-thumbs__item').last().index() + 1;
    from = from || lastPreloaded;
    to = to || from + 5 ;
    for (var i = from; i < to; i++){
        if (imagesData[i]) {
            createThumb(i);
        }
    }
}

function takeFirstImage() {
    var firstImgLink = imagesData[0].img.L.href,
        firstImgAlt = imagesData[0].title,
        sliderItem = $('<li class="b-slider__item" />');

    $('<li class="b-slider__item" style="width:'+dWidth+'px;"><img class="b-slider__img" src="'+firstImgLink+'"/></li>').appendTo(slider);
}


function changeImg(direction, thumb) {

    var selectedThumb = $('.b-thumbs__item-selected'),
        imageLink,
        imageAlt,
        getDirection = function (thumb){
            if(selectedThumb.index() < thumb.index()){
                return 'next';
            }else{ return 'prev';}
        },
        sliderItem = function (link, alt){
            alt = alt || 'alt';
            return $('<li />',{
                class: 'b-slider__item',
                css: ({
                    width: dWidth
                })
            }).append(image(link, alt, 'b-slider__img'));
        };

    thumb = thumb || undefined;
    direction = ( direction === 'thumb') ? getDirection(thumb) : direction;


    if (direction == 'next'){
        if (!thumb){
            imageLink = selectedThumb.next().data('info').src;
            imageAlt = selectedThumb.next().data('info').alt;

            selectedThumb.removeClass('b-thumbs__item-selected').next().addClass('b-thumbs__item-selected');
        }else {
            imageLink = thumb.data('info').src;
            imageAlt = thumb.data('info').alt;

            thumb.addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');
        }

        slider.append(sliderItem(imageLink, imageAlt)).animate({left: "-="+dWidth+"px"}, 500, function () {
            slider.css('left', 0).children().first().remove();
        });

    }else if (direction == 'prev'){
        if (!thumb){
            imageLink = selectedThumb.prev().data('info').src;
            imageAlt = selectedThumb.prev().data('info').alt;

            selectedThumb.removeClass('b-thumbs__item-selected').prev().addClass('b-thumbs__item-selected');
        }else {
            imageLink = thumb.data('info').src;
            imageAlt = thumb.data('info').alt;

            thumb.addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');
        }

        slider.css('left', -dWidth).prepend(sliderItem(imageLink, imageAlt)).animate({left:"+="+dWidth+"px"}, 500, function () {
            slider.css('left', 0).children().last().remove();
        });

    }

}

function calcWidth() {
    dWidth = $(document).width();
    $('.b-slider__item').css('width', dWidth);
}

$(window).load(function () {
    getData();
    calcWidth();
});

$(window).resize(function () {
    calcWidth();
});

$(function () {
    $('body').on('click', '.b-thumbs__item', function () {
        changeImg('thumb', $(this));
    });



    $('.b-thumbs__bg').on('mousewheel', function(event, delta) {
        var val = this.scrollLeft - (delta * 50);
        $(this).scrollLeft(val);
        imagesPreload();
    });

    $('.b-thumbs__wrap').mouseenter(function() {
        $('.b-thumbs__bg').animate({bottom:"+=95px"}, 350);
    }).mouseleave(function() {
        $('.b-thumbs__bg').animate({bottom:"-=95px"}, 350);
    });
});