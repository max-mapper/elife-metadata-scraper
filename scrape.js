var electron = require('electron')
var createMicroscope = require('electron-microscope')
var concat = require('concat-stream')

electron.app.on('ready', function () {
  createMicroscope({show: false}, function (err, scope) {
    if (err) throw err
    scrape(1)

    function scrape (pageNum) {
      scope.loadURL(page(pageNum), function (err) {
        if (err) throw err
        var count = 0
        var runStream = scope.run(getDOIs)
        runStream.on('data', function (d) {
          console.log(d.toString())
          count++
        })
        runStream.on('end', function () {
          if (count !== 100) return scope.destroy()
          scrape(pageNum + 1)
        })
      })
    }
  })
})

function page (n) {
  return 'http://elifesciences.org/search?keyword=&page=' + n + '&sort_by=search_api_relevance&items_per_page=100'
}

function getDOIs (send, done) {
  var dois = document.querySelectorAll('.article-teaser__doi')
  for (var i = 0; i < dois.length; i++) send(dois[i].innerText)
  done()
}
