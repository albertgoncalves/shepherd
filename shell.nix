with import <nixpkgs> {};
mkShell.override { stdenv = llvmPackages_16.stdenv; } {
    buildInputs = [
        gimp
        glibcLocales
        html-tidy
        nodePackages.jshint
        nodePackages.typescript
        python3Packages.flake8
        shellcheck
    ];
    shellHook = ''
        . .shellhook
    '';
}
