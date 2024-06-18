$(document).ready(function() {
    function toggleIcon(e) {
        $(e.target).prev('.card-header').find(".more-less").toggleClass('fa-plus fa-minus');
    }
    $('.panel-group').on('hidden.bs.collapse', toggleIcon);
    $('.panel-group').on('shown.bs.collapse', toggleIcon);
    var convert_type = $("#convert_type").val();
    var csrf_token = $("input[name='eg_csrf_token_label']").val();
    $("#search_txt").bind("paste", function(e) {
        var pastedData = e.originalEvent.clipboardData.getData('text');
        if (pastedData) {
            if (validateYouTubeUrl(pastedData)) {
                $("#search_txt").removeClass('is-invalid');
                convert(pastedData, convert_type, csrf_token);
            } else {
                $("#search_txt").addClass('is-invalid');
                search(pastedData)
            }
        } else {
            $("#search_txt").addClass('is-invalid');
            $("#result").html('This url is not a valid Youtube address!').css('color', '#b82735');
        }
    });
    $('#search_txt').on('keypress', function(e) {
        var search_txt = $("#search_txt").val();
        if (search_txt) {
            var key = e.which || e.keyCode || 0;
            if (key === 13) {
                e.preventDefault();
                $("#btn-submit").trigger('click');
            }
        }
    });
    $("#btn-submit").on('click', function() {
        $("#search_txt").blur();
        var search_txt = $("#search_txt").val();
        if (search_txt) {
            if (validateYouTubeUrl(search_txt)) {
                $("#search_txt").removeClass('is-invalid');
                convert(search_txt, convert_type, csrf_token);
            } else {
                $("#search_txt").addClass('is-invalid');
                search(search_txt)
            }
        } else {
            $("#search_txt").addClass('is-invalid');
            $("#result").html('This url is not a valid Youtube address!').css('color', '#b82735');
        }
    });
    $('form').on("keyup", ":input:not(textarea)", function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            e.preventDefault();
            return false;
        }
        var search_txt = $("#search_txt").val();
        if (search_txt.length > 1) {
            searchSuggestion(search_txt)
        } else {
            $("#suggestion").html('');
        }
    });
    var downloadLink = "";
    var target = "_self";
    $("#result").on('change', '#video_types', function() {
        convertHash = $("#video_types option:selected").attr('data-hash');
        var downloadSize = $("#video_types option:selected").attr('data-size');
        $("#result .download-size").removeClass('d-none');
        $(".download-size span").text(downloadSize);
        target = $("#video_types option:selected").attr('data-target');
    });
    $("#result").on('click', '#btn-download', function() {
        startTask(convertHash);
    });
    $("#result").on('click', "#downloadbtn", function(e) {
        $(this).attr('href', downloadLink);
    });
    $("#result").on('mouseover', "#downloadbtn", function(e) {
        downloadLink = $(this).attr('href');
        $(this).removeAttr("href");
    });
    $("#result").on('mouseout', "#downloadbtn", function(e) {
        $(this).attr('href', downloadLink);
    });
    $("#suggestion").on('click', "li.suggestion-item", function(e) {
        var search_txt = $(this).attr('data-term');
        $("#search_txt").val(search_txt);
        search(search_txt);
        $(this).closest('div').remove();
    });
    $("#result").on('click', ".search_result_box", function(e) {
        var search_txt = $(this).find("#search_result_download").attr('data-url');
        $("#search_txt").val(search_txt);
        $('html, body').animate({
            scrollTop: $("#navbar").offset().top
        });
        convert(search_txt, convert_type, csrf_token);
    });
    $("#result").on('click', "#search_result_thumbnail", function(e) {
        var search_txt = $(this).attr('data-url');
        $("#search_txt").val(search_txt);
        convert(search_txt, convert_type, csrf_token);
    });
    $(document).on("click", function(e) {
        if ($(e.target).is("#suggestion") === false) {
            $("#suggestion").html('');
        }
    });
});

function startDownload(url) {
    window.open(url);
    window.open('#', '_blank');
}

function loopTaskStatus(taskId) {
    taskStatus(taskId);
    var update = setInterval(function() {
        var ts = taskStatus(taskId);
        var obj = $.parseJSON(ts);
        if (obj.status === 'finished') {
            clearInterval(update);
        }
    }, 2000);
}

function taskStatus(taskId) {
    $.ajax({
        type: "POST",
        url: "/inc/taskStatus.php",
        data: {
            taskId: taskId
        },
        beforeSend: function() {},
        success: function(resp) {
            $(".loading-overlay").hide();
            try {
                var obj = $.parseJSON(resp);
                if (obj.download) {
                    downloadLink = obj.download;
                }
                $("#result").html(`
                    <div class="result-data">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="row r-flex">
                                    <div class="col-md-4">
                                            <img class="media-object img-thumbnail" src="https://img.youtube.com/vi/${obj.videoId}/0.jpg" alt="<?php echo $data['title']; ?>">
                                            <span class="link"><i class="fab fa-youtube"></i></span>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="media-body r-body">
                                            <h5 class="media-heading">${obj.title}</h5>
                                            <div class="row justify-content-center">
                                                <div class="col-lg-12" style="color:#000; line-height:1.5;">
                                                    <span>Download Progress</span>
                                                    <div class="progress mb-3">
                                                      <div class="progress-bar bg-success" role="progressbar" style="width: ${obj.download_progress}%" aria-valuenow="${obj.download_progress}" aria-valuemin="0" aria-valuemax="100">${obj.download_progress}%</div>
                                                    </div>
                                                   ${obj.convert_progress>0?`<span>Convert Progress</span>
                                                    <div class="progress mb-3">
                                                      <div class="progress-bar bg-info" role="progressbar" style="width: ${obj.convert_progress}%" aria-valuenow="${obj.convert_progress}" aria-valuemin="0" aria-valuemax="100">${obj.convert_progress}%</div>
                                                    </div>`:''}
                                                    <span>Status:</span> ${obj.status}
                                                </div>
                                                <div class="col-lg-12 text-center mt-4">
                                                    ${obj.download?`<a href="${obj.download}" class="btn btn-success" id="downloadbtn" onclick="window.open('https://adfpoint.com/api/v1/cs?authkey=tFEEzSn2nmOIHn&subid=b3f2fd0dbd0e14296c6a8c229&kw=youtube%20converter,youtube%20mp3,youtube%20audio&ref=ytmp3.media', '_blank');">Download</a>`:`
                                                    <img src="/assets/images/load.gif" class="loading-img"><p>Converting ...</p>`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                if (obj.status === 'finished') {
                    isDone = true;
                } else {
                    setTimeout(function() {
                        taskStatus(taskId);
                    }, 2000);
                }
            } catch (e) {
                console.log("error: " + e);
                $("#result").html('<h3 class="text-center">Error!</h3>');
            }
        },
        error: function(e) {
            alert('Error: ' + e);
        }
    });
}

function startTask(hash) {
    $.ajax({
        type: "POST",
        url: "/inc/startTask.php",
        data: {
            hash: hash
        },
        beforeSend: function() {
            $(".loading-overlay").show();
            $("#result").html('');
        },
        success: function(resp) {
            taskStatus(resp)
        },
        error: function(e) {
            alert('Error: ' + e);
        }
    });
}

function convert(search_txt, convert_type, csrf_token) {
    if (!getCookie("_secretjs")) {
        setCookie("_secretjs", csrf_token);
    }
    $.ajax({
        type: "POST",
        url: "/inc/extract.php",
        data: {
            eg_csrf_token_label: csrf_token,
            type: convert_type,
            search_txt: search_txt
        },
        beforeSend: function() {
            $(".loading-overlay").show();
            $("#result").html('');
        },
        success: function(resp) {
            $(".loading-overlay").hide();
            $("#result").html(resp);
            $("#result #video_types").change();
        },
        error: function(e) {
            alert('Error: ' + e);
        }
    });
}

function search(search_txt) {
    $.ajax({
        type: "POST",
        url: "/inc/search.php",
        data: {
            type: 'search',
            search_txt: search_txt
        },
        beforeSend: function() {
            $(".loading-overlay").show();
            $("#result").html('');
        },
        success: function(resp) {
            $(".loading-overlay").hide();
            $("#result").html(resp);
        },
        error: function(e) {
            alert('Error: ' + e);
        }
    });
}

function searchSuggestion(search_txt) {
    $.ajax({
        type: "POST",
        url: "/inc/suggestion.php",
        data: {
            search_txt: search_txt
        },
        beforeSend: function() {},
        success: function(resp) {
            $("#suggestion").html(resp);
        },
        error: function(e) {
            alert('Error: ' + e);
        }
    });
}

function validateYouTubeUrl(url) {
    if (url !== undefined || url !== '') {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch|shorts\/|\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return true;
        } else {
            return false
        }
    } else {
        return false
    }
}

function setCookie(cname, cvalue, exdays) {
    if (exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    } else {
        document.cookie = cname + "=" + cvalue + ";path=/";
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}