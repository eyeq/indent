var wsh = new ActiveXObject("WScript.Shell");

var INDENT = "  ";
var NEW_LINE = "\r\n";

function begin_block(line) {
  return line.match("{") != null;
}

function end_block(line) {
  return line.match("}") != null;
}

function during_comment(line) {
  return line.match(/^(\/\/|\/\*|\*)/g) != null;
}

function main() {
  var inside_comment = false;
  var inside_block = false;

  var nest = 0;
  var result_lines = [];

  Editor.TextWrapMethod(0);
  if(Editor.IsTextSelected() == 0) {
    Editor.SelectAll(0);
  }
  var select_from = Editor.GetSelectLineFrom();
  var select_to = Editor.GetSelectLineTo();
  for (var i = 1; i <= select_to; i++) {
    var line = Editor.GetLineStr(i);
    var criteria = line.trim();
    if(criteria == "{") {
      nest++;
      result_lines[result_lines.length - 1] += " {";
      continue;
    }
    if(during_comment(line)) {
      criteria = "";
    }

    criteria = criteria.replace(/".+?"/g, "").replace(/\/.+?\//g, "").replace(/\{.+?\}/g, "");
    if(end_block(criteria)) {
      nest--;
    }
    if(select_from <= i) {
      var ltr = true;
      var rtr = true;

      var begin = 0;
      var end = line.length;
      if(i == select_from) {
        begin = byte_to_charnum(line, Editor.GetSelectColmFrom() - 1);
        ltr = false;
      }
      if(i == select_to) {
        end = byte_to_charnum(line, Editor.GetSelectColmTo() - 1);
        if(line.substring(end, line.length).match(/[^\s　]/g)) {
          rtr = false;
        }
      }
      line = line.substring(begin, end);

      var n = nest;
      if(ltr) {
        line = line.ltrim();
      } else {
        n = -1;
      }
      if(rtr) {
        line = line.rtrim();
      }
      result_lines.push(normalize_space(line, n));
    }
    if(begin_block(criteria)) {
      nest++;
    }
  }
  Editor.InsText(result_lines.join(NEW_LINE));
}

// GetSelectColmはバイト数を返す
function byte_to_charnum(str, byte) {
  for(var i = 0; i < byte; i++) {
    if (escape(str.charAt(i)).length >= 4) {
      byte--;
    }
  }
  return byte;
}

function normalize_space(line, num) {
  // 空白行はインデントしない
  if(!line) {
    return line;
  }
  // numが負の場合、先頭空白を削除しない
  if(num >= 0) {
    line = line.replace(/^[\s　]*(?!(\/\*|\*))/g, INDENT.repeat(num));
  }
  line = line.replace(/\)[\s　]*{/g, ") {");
  return line;
}

String.prototype.repeat = function(num) {
  for (var str = ""; (this.length * num) > str.length; str += this);
  return str;
};

String.prototype.trim = function() {
  return this.replace(/^[\s　]+|[\s　]+$/g, '');
}

String.prototype.ltrim = function() {
  return this.replace(/^[\s　]+/g, '');
}

String.prototype.rtrim = function() {
  return this.replace(/[\s　]+$/g, '');
}

main();
